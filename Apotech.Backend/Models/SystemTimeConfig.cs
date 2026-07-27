using System;

namespace Apotech.Backend.Models;

public partial class SystemTimeConfig
{
    public string Id { get; set; } = "default";

    public string NtpServer { get; set; } = "pool.ntp.org";

    public int SyncIntervalSeconds { get; set; } = 300;

    public int MaxDriftThresholdMs { get; set; } = 1000;

    public string TimeZone { get; set; } = "UTC";

    public string? UpdatedById { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual User? UpdatedBy { get; set; }
}
