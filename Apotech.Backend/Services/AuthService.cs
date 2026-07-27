using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace Apotech.Backend.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<User> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
    Task<object> GetMeAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly IAuditService _auditService;

    public AuthService(AppDbContext context, IConfiguration config, IAuditService auditService)
    {
        _context = context;
        _config = config;
        _auditService = auditService;
    }

    private string GenerateJwtToken(User user, List<string> roles)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secret = _config["Jwt:Key"] ?? "your_super_secret_key_which_is_at_least_32_bytes_long";
        var key = Encoding.UTF8.GetBytes(secret);
        
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(15), // Short-lived access token
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task<string> GenerateRefreshTokenAsync(User user)
    {
        var refreshToken = Guid.NewGuid().ToString("N");
        
        var session = new Session
        {
            Id = Guid.NewGuid().ToString(),
            SessionToken = refreshToken,
            UserId = user.Id,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();

        return refreshToken;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.Password == null)
        {
            await _auditService.LogAsync("LOGIN_FAILED", userEmail: request.Email, details: "User not found or missing password.");
            throw new Exception("Invalid email or password");
        }

        // Account Lockout check
        if (user.IsLocked)
        {
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                var remainingMinutes = Math.Max(1, (int)Math.Ceiling((user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes));
                await _auditService.LogAsync("LOGIN_BLOCKED", user.Id, user.Email, details: $"Attempted login while account locked. {remainingMinutes} min remaining.");
                throw new Exception($"Account is locked due to multiple failed login attempts. Please try again after {remainingMinutes} minute(s) or contact an administrator.");
            }
            else
            {
                // Auto unlock expired lockout
                user.IsLocked = false;
                user.LockoutEnd = null;
                user.FailedAttemptCount = 0;
            }
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            user.FailedAttemptCount += 1;

            if (user.FailedAttemptCount >= 5)
            {
                user.IsLocked = true;
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                await _context.SaveChangesAsync();
                await _auditService.LogAsync("ACCOUNT_LOCKED", user.Id, user.Email, details: "Account locked after 5 consecutive failed login attempts.");
                throw new Exception("Account is locked due to multiple failed login attempts. Please try again after 15 minutes or contact an administrator.");
            }

            await _context.SaveChangesAsync();
            await _auditService.LogAsync("LOGIN_FAILED", user.Id, user.Email, details: $"Failed login attempt {user.FailedAttemptCount}/5.");
            throw new Exception("Invalid email or password");
        }

        // Login success: reset failed counter
        user.FailedAttemptCount = 0;
        user.IsLocked = false;
        user.LockoutEnd = null;
        await _context.SaveChangesAsync();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        var token = GenerateJwtToken(user, roles);
        var refreshToken = await GenerateRefreshTokenAsync(user);

        await _auditService.LogAsync("LOGIN_SUCCESS", user.Id, user.Email);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            User = new { user.Id, user.Email, user.Name, roles, permissions }
        };
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken)
    {
        var session = await _context.Sessions
            .Include(s => s.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(s => s.SessionToken == refreshToken);

        if (session == null) throw new Exception("Invalid refresh token");
        if (session.Expires < DateTime.UtcNow)
        {
            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();
            throw new Exception("Refresh token expired");
        }

        var user = session.User;
        if (user.IsLocked && user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
        {
            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();
            throw new Exception("Account locked");
        }

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        // Rotate refresh token
        _context.Sessions.Remove(session);
        var newToken = GenerateJwtToken(user, roles);
        var newRefreshToken = await GenerateRefreshTokenAsync(user);

        return new AuthResponse
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            User = new { user.Id, user.Email, user.Name, roles, permissions }
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var session = await _context.Sessions.FirstOrDefaultAsync(s => s.SessionToken == refreshToken);
        if (session != null)
        {
            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();
            await _auditService.LogAsync("LOGOUT", session.UserId);
        }
    }

    public async Task<object> GetMeAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new Exception("User not found");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

        return new { user.Id, user.Email, user.Name, roles, permissions };
    }

    public async Task<User> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new Exception("Email already exists");

        var user = new User
        {
            Id = Guid.NewGuid().ToString("N"),
            Email = request.Email,
            Name = request.Name,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
}
