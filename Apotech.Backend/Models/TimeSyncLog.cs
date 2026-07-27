using System;

namespace Apotech.Backend.Models;

public partial class TimeSyncLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    public string NtpServer { get; set; } = null!;

    public double OffsetMs { get; set; }

    public double RoundTripMs { get; set; }

    public string Status { get; set; } = "OK"; // OK, WARNING, ERROR

    public string? Details { get; set; }

    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}
