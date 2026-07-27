using System;
using System.Threading.Tasks;
using Apotech.Backend.Models;

namespace Apotech.Backend.Services;

public interface IAuditService
{
    Task LogAsync(string action, string? userId = null, string? userEmail = null, string? ipAddress = null, string? details = null);
}

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string action, string? userId = null, string? userEmail = null, string? ipAddress = null, string? details = null)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid().ToString("N"),
            UserId = userId,
            UserEmail = userEmail,
            Action = action,
            IpAddress = ipAddress,
            Details = details,
            CreatedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}
