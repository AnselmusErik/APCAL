using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Services;

public interface IUserService
{
    Task<PaginationResponse<User>> GetAllUsersAsync(int page, int limit);
    Task UnlockUserAsync(string userId, string? adminUserId);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly IAuditService _auditService;

    public UserService(AppDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PaginationResponse<User>> GetAllUsersAsync(int page, int limit)
    {
        var total = await _context.Users.CountAsync();
        var data = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(u => new User { Id = u.Id, Name = u.Name, Email = u.Email, IsLocked = u.IsLocked, LockoutEnd = u.LockoutEnd, FailedAttemptCount = u.FailedAttemptCount, CreatedAt = u.CreatedAt, UpdatedAt = u.UpdatedAt })
            .ToListAsync();

        return new PaginationResponse<User>
        {
            Data = data,
            Total = total,
            Page = page,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
        };
    }

    public async Task UnlockUserAsync(string userId, string? adminUserId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new Exception("User not found");

        user.IsLocked = false;
        user.LockoutEnd = null;
        user.FailedAttemptCount = 0;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync("ACCOUNT_UNLOCKED", user.Id, user.Email, details: $"Account manually unlocked by admin ID: {adminUserId ?? "System"}");
    }
}
