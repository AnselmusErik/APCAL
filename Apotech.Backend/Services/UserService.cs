using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Services;

public interface IUserService
{
    Task<PaginationResponse<User>> GetAllUsersAsync(int page, int limit);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginationResponse<User>> GetAllUsersAsync(int page, int limit)
    {
        var total = await _context.Users.CountAsync();
        var data = await _context.Users
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(u => new User { Id = u.Id, Name = u.Name, Email = u.Email, CreatedAt = u.CreatedAt, UpdatedAt = u.UpdatedAt }) // Project to exclude password
            .ToListAsync();

        return new PaginationResponse<User>
        {
            Data = data,
            Total = total,
            Page = page,
            TotalPages = (int)Math.Ceiling(total / (double)limit)
        };
    }
}
