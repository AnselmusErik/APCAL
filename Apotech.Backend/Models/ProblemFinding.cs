using System;
using System.Collections.Generic;

namespace Apotech.Backend.Models;

public partial class ProblemFinding
{
    public string Id { get; set; } = null!;

    public string VerificationId { get; set; } = null!;

    public int Position { get; set; }

    public string Label { get; set; } = null!;

    public int FindingCount { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ProblemVerification Verification { get; set; } = null!;
}
