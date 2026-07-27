using System.Security.Claims;
using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Apotech.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemController : ControllerBase
{
    private readonly INtpService _ntpService;
    private readonly AppDbContext _context;
    private readonly IAuditService _auditService;

    public SystemController(INtpService ntpService, AppDbContext context, IAuditService auditService)
    {
        _ntpService = ntpService;
        _context = context;
        _auditService = auditService;
    }

    [HttpGet("time")]
    public async Task<IActionResult> GetServerTime()
    {
        try
        {
            var status = await _ntpService.GetServerTimeStatusAsync();
            return Ok(status);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "ADMIN")]
    [HttpGet("time-config")]
    public async Task<IActionResult> GetTimeConfig()
    {
        try
        {
            var config = await _context.SystemTimeConfigs.FirstOrDefaultAsync(c => c.Id == "default");
            if (config == null)
            {
                config = new SystemTimeConfig
                {
                    Id = "default",
                    NtpServer = "pool.ntp.org",
                    SyncIntervalSeconds = 300,
                    MaxDriftThresholdMs = 1000,
                    TimeZone = "UTC",
                    UpdatedAt = DateTime.UtcNow
                };
                _context.SystemTimeConfigs.Add(config);
                await _context.SaveChangesAsync();
            }

            return Ok(new TimeConfigResponse
            {
                Id = config.Id,
                NtpServer = config.NtpServer,
                SyncIntervalSeconds = config.SyncIntervalSeconds,
                MaxDriftThresholdMs = config.MaxDriftThresholdMs,
                TimeZone = config.TimeZone,
                UpdatedById = config.UpdatedById,
                UpdatedAt = config.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("time-config")]
    public async Task<IActionResult> UpdateTimeConfig([FromBody] UpdateTimeConfigRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest(new { error = "Reason/Justification is mandatory for date/time configuration modification (GAMP 5 CSV requirement)." });
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var config = await _context.SystemTimeConfigs.FirstOrDefaultAsync(c => c.Id == "default");
            if (config == null)
            {
                config = new SystemTimeConfig { Id = "default" };
                _context.SystemTimeConfigs.Add(config);
            }

            var previousValue = $"NtpServer={config.NtpServer}, SyncInterval={config.SyncIntervalSeconds}s, MaxDrift={config.MaxDriftThresholdMs}ms, TimeZone={config.TimeZone}";

            config.NtpServer = request.NtpServer;
            config.SyncIntervalSeconds = request.SyncIntervalSeconds;
            config.MaxDriftThresholdMs = request.MaxDriftThresholdMs;
            config.TimeZone = request.TimeZone;
            config.UpdatedById = userId;
            config.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var newValue = $"NtpServer={config.NtpServer}, SyncInterval={config.SyncIntervalSeconds}s, MaxDrift={config.MaxDriftThresholdMs}ms, TimeZone={config.TimeZone}";

            await _auditService.LogAsync(
                action: "TIME_CONFIG_CHANGE",
                userId: userId,
                userEmail: userEmail,
                details: $"Previous: [{previousValue}] | New: [{newValue}] | Reason: {request.Reason}"
            );

            return Ok(new TimeConfigResponse
            {
                Id = config.Id,
                NtpServer = config.NtpServer,
                SyncIntervalSeconds = config.SyncIntervalSeconds,
                MaxDriftThresholdMs = config.MaxDriftThresholdMs,
                TimeZone = config.TimeZone,
                UpdatedById = config.UpdatedById,
                UpdatedAt = config.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
