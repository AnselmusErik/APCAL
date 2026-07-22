using System;
using System.Collections.Generic;

namespace Apotech.Backend.Models;

public partial class ProblemVerification
{
    public string Id { get; set; } = null!;

    public DateOnly Date { get; set; }

    public string ProductCode { get; set; } = null!;

    public string BatchNumber { get; set; } = null!;

    public string Location { get; set; } = null!;

    public string AqlCriteria { get; set; } = null!;

    public int SampleSize { get; set; }

    public string? Keterangan { get; set; }

    public string? Kesimpulan { get; set; }

    public string? CreatedById { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual User? CreatedBy { get; set; }

    public virtual ICollection<ProblemFinding> ProblemFindings { get; set; } = new List<ProblemFinding>();
}
