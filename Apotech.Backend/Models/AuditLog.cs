using System;

namespace Apotech.Backend.Models;

public partial class AuditLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");

    public string? UserId { get; set; }

    public string? UserEmail { get; set; }

    public string Action { get; set; } = null!;

    public string? IpAddress { get; set; }

    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User? User { get; set; }
}
