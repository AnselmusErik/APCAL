namespace Apotech.Backend.DTOs;

public class SamplingRequest
{
    public string? ProductName { get; set; }
    public string? BatchNumber { get; set; }
    public int LotSize { get; set; }
    /// <summary>Inspection Type: normal / tightened / reduced — selects sampling plan table</summary>
    public string InspectionLevel { get; set; } = null!;
    /// <summary>Inspection Code: S1/S2/S3/S4/GI/GII/GIII — selects column in ANSI Table I</summary>
    public string InspectionCode { get; set; } = "GII";
}

public class EvaluationRequest
{
    public SamplingResult SamplingResult { get; set; } = null!;
    public DefectCount DefectCounts { get; set; } = null!;
}

public class SamplingResult
{
    public string? ProductName { get; set; }
    public string? BatchNumber { get; set; }
    public int LotSize { get; set; }
    /// <summary>Inspection Type: normal / tightened / reduced</summary>
    public string InspectionLevel { get; set; } = null!;
    /// <summary>Inspection Code: S1/S2/S3/S4/GI/GII/GIII</summary>
    public string InspectionCode { get; set; } = "GII";
    /// <summary>Human-readable label e.g. "General II" or "Special S-1"</summary>
    public string InspectionCodeLabel { get; set; } = null!;
    public string LetterCode { get; set; } = null!;
    public SamplingPlan SamplingPlan { get; set; } = null!;
    public string InspectionTypeLabel { get; set; } = null!;
}

public class SamplingPlan
{
    public string Code { get; set; } = null!;
    public int SampleSize { get; set; }
    public DefectLimit Critical { get; set; } = null!;
    public DefectLimit Major { get; set; } = null!;
    public DefectLimit Minor { get; set; } = null!;
}

public class DefectLimit
{
    public int Ac { get; set; }
    public int Re { get; set; }

    public DefectLimit() { }
    public DefectLimit(int ac, int re)
    {
        Ac = ac;
        Re = re;
    }
}

public class DefectCount
{
    public int Critical { get; set; }
    public int Major { get; set; }
    public int Minor { get; set; }
}

public class EvaluationResult
{
    public string Decision { get; set; } = null!;
    public string Reason { get; set; } = null!;
    public bool RevertToNormal { get; set; }
    public object Summary { get; set; } = null!;
}
