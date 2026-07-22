using Apotech.Backend.Models;

namespace Apotech.Backend.DTOs;

public class CreateVerificationRequest
{
    public DateOnly Date { get; set; }
    public string ProductCode { get; set; } = null!;
    public string BatchNumber { get; set; } = null!;
    public string Location { get; set; } = null!;
    public string AqlCriteria { get; set; } = null!;
    public UnitType UnitType { get; set; }
    public InspectionGeneralLevel GeneralLevel { get; set; }
    public int SampleSize { get; set; }
    public string? Keterangan { get; set; }
    public string? Kesimpulan { get; set; }
    public List<FindingDto> Findings { get; set; } = new();
}

public class FindingDto
{
    public string Label { get; set; } = null!;
    public ContainerType ContainerType { get; set; }
    public int FindingCount { get; set; }
    public string? Description { get; set; }
}
