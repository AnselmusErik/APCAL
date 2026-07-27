using System;
using System.Threading;
using System.Threading.Tasks;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Apotech.Backend.Services;

public class NtpMonitoringHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NtpMonitoringHostedService> _logger;

    public NtpMonitoringHostedService(IServiceProvider serviceProvider, ILogger<NtpMonitoringHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[NTP MONITOR] Routine NTP time synchronization service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            int delaySeconds = 300; // default 5 minutes

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var ntpService = scope.ServiceProvider.GetRequiredService<INtpService>();
                var auditService = scope.ServiceProvider.GetRequiredService<IAuditService>();

                var config = await dbContext.SystemTimeConfigs.FirstOrDefaultAsync(c => c.Id == "default", stoppingToken);
                if (config != null && config.SyncIntervalSeconds > 0)
                {
                    delaySeconds = config.SyncIntervalSeconds;
                }

                var syncLog = await ntpService.PerformTimeSyncCheckAsync();
                
                if (syncLog.Status == "WARNING" || syncLog.Status == "ERROR")
                {
                    _logger.LogWarning($"[NTP MONITOR ALERT] Time sync status: {syncLog.Status}. Details: {syncLog.Details}");
                    await auditService.LogAsync(
                        action: "TIME_SYNC_FAILURE",
                        details: $"NTP Server: {syncLog.NtpServer}, Status: {syncLog.Status}, OffsetMs: {syncLog.OffsetMs:F2}, Details: {syncLog.Details}"
                    );
                }
                else
                {
                    _logger.LogInformation($"[NTP MONITOR] Verified NTP time sync cleanly. Offset: {syncLog.OffsetMs:F2}ms.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[NTP MONITOR ERROR] Error during NTP routine monitoring check.");
            }

            await Task.Delay(TimeSpan.FromSeconds(delaySeconds), stoppingToken);
        }

        _logger.LogInformation("[NTP MONITOR] Routine NTP monitoring service stopped.");
    }
}
