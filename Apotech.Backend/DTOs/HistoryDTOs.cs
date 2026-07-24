namespace Apotech.Backend.DTOs;

// ── Request ──────────────────────────────────────────────────────────────────

/// <summary>Payload dari Next.js saat menyimpan hasil kalkulasi sampling plan.</summary>
public class SaveHistoryRequest
{
    public string? ProductName { get; set; }
    public string? BatchNumber { get; set; }
    public int LotSize { get; set; }
    public string LetterCode { get; set; } = null!;
    public int SampleSize { get; set; }
    public string InspectionLevel { get; set; } = null!;
    public string InspectionCode { get; set; } = "GII";
    public string InspectionCodeLabel { get; set; } = null!;
    public string InspectionTypeLabel { get; set; } = null!;

    public HistoryDefectLimit SamplingPlanCritical { get; set; } = null!;
    public HistoryDefectLimit SamplingPlanMajor { get; set; } = null!;
    public HistoryDefectLimit SamplingPlanMinor { get; set; } = null!;

    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public DefectCount? DefectCounts { get; set; }

    /// <summary>Optional: user ID dari session (dikirim jika user login)</summary>
    public string? CreatedById { get; set; }
}

public class UpdateHistoryEvaluationRequest
{
    public string Decision { get; set; } = null!;
    public string DecisionReason { get; set; } = null!;
    public DefectCount DefectCounts { get; set; } = null!;
}

public class HistoryDefectLimit
{
    public int Ac { get; set; }
    public int Re { get; set; }
}

// ── Response ─────────────────────────────────────────────────────────────────

/// <summary>Shape response history yang dikirim ke frontend.</summary>
public class SamplingHistoryDto
{
    public Guid Id { get; set; }
    public string? ProductName { get; set; }
    public string? BatchNumber { get; set; }
    public int LotSize { get; set; }
    public string LetterCode { get; set; } = null!;
    public int SampleSize { get; set; }
    public string InspectionLevel { get; set; } = null!;
    public string InspectionCode { get; set; } = null!;
    public string InspectionCodeLabel { get; set; } = null!;
    public string InspectionTypeLabel { get; set; } = null!;

    public HistoryDefectLimit Critical { get; set; } = null!;
    public HistoryDefectLimit Major { get; set; } = null!;
    public HistoryDefectLimit Minor { get; set; } = null!;

    public string? Decision { get; set; }
    public string? DecisionReason { get; set; }
    public DefectCount? DefectCounts { get; set; }

    public DateTime CreatedAt { get; set; }
}
