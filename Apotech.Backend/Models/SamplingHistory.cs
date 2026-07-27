namespace Apotech.Backend.Models;

/// <summary>
/// Riwayat kalkulasi Sampling Plan ANSI/ASQ Z1.4.
/// Tabel: sampling_histories
/// </summary>
public class SamplingHistory
{
    public Guid Id { get; set; }

    public string? ProductName { get; set; }
    public string? BatchNumber { get; set; }

    public int LotSize { get; set; }
    public string LetterCode { get; set; } = null!;
    public int SampleSize { get; set; }

    /// <summary>normal | tightened | reduced</summary>
    public string InspectionLevel { get; set; } = null!;
    /// <summary>S1 | S2 | S3 | S4 | GI | GII | GIII</summary>
    public string InspectionCode { get; set; } = null!;
    public string InspectionCodeLabel { get; set; } = null!;
    public string InspectionTypeLabel { get; set; } = null!;

    // Sampling plan limits — Critical
    public int PlanCriticalAc { get; set; }
    public int PlanCriticalRe { get; set; }

    // Sampling plan limits — Major
    public int PlanMajorAc { get; set; }
    public int PlanMajorRe { get; set; }

    // Sampling plan limits — Minor
    public int PlanMinorAc { get; set; }
    public int PlanMinorRe { get; set; }

    // Evaluasi cacat & keputusan (Accept / Reject)
    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public int DefectCritical { get; set; }
    public int DefectMajor { get; set; }
    public int DefectMinor { get; set; }

    /// <summary>FK ke users (nullable — kalkulasi boleh dilakukan tanpa login)</summary>
    public string? CreatedById { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public User? CreatedBy { get; set; }
}
