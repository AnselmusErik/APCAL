using System;

namespace Apotech.Backend.DTOs;

public class ServerTimeResponse
{
    public DateTime ServerUtcTime { get; set; }
    public string TimeZone { get; set; } = "UTC";
    public string NtpServer { get; set; } = null!;
    public bool IsSynchronized { get; set; }
    public double DriftOffsetMs { get; set; }
    public double RoundTripMs { get; set; }
    public DateTime LastCheckedAt { get; set; }
}

public class UpdateTimeConfigRequest
{
    public string NtpServer { get; set; } = "pool.ntp.org";
    public int SyncIntervalSeconds { get; set; } = 300;
    public int MaxDriftThresholdMs { get; set; } = 1000;
    public string TimeZone { get; set; } = "UTC";
    public string Reason { get; set; } = null!;
}

public class TimeConfigResponse
{
    public string Id { get; set; } = "default";
    public string NtpServer { get; set; } = null!;
    public int SyncIntervalSeconds { get; set; }
    public int MaxDriftThresholdMs { get; set; }
    public string TimeZone { get; set; } = null!;
    public string? UpdatedById { get; set; }
    public DateTime UpdatedAt { get; set; }
}
