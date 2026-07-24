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
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || user.Password == null) throw new Exception("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            throw new Exception("Invalid credentials");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .Distinct()
            .ToList();

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
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return new AuthResponse
        {
            Token = tokenHandler.WriteToken(token),
            User = new { user.Id, user.Email, user.Name, roles, permissions }
        };
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
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
}
