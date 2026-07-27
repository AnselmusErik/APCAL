using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Services;

public interface IHistoryService
{
    Task<SamplingHistoryDto> SaveSamplingHistoryAsync(SaveHistoryRequest request);
    Task<SamplingHistoryDto?> UpdateEvaluationAsync(Guid id, UpdateHistoryEvaluationRequest request);
    Task<IEnumerable<SamplingHistoryDto>> GetSamplingHistoriesAsync(int limit = 50);
    Task<bool> DeleteSamplingHistoryAsync(Guid id);
    Task<int> ClearSamplingHistoriesAsync();
}

public class HistoryService : IHistoryService
{
    private readonly AppDbContext _db;

    public HistoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SamplingHistoryDto> SaveSamplingHistoryAsync(SaveHistoryRequest request)
    {
        var entity = new SamplingHistory
        {
            ProductName        = request.ProductName,
            BatchNumber        = request.BatchNumber,
            LotSize            = request.LotSize,
            LetterCode         = request.LetterCode,
            SampleSize         = request.SampleSize,
            InspectionLevel    = request.InspectionLevel,
            InspectionCode     = request.InspectionCode,
            InspectionCodeLabel = request.InspectionCodeLabel,
            InspectionTypeLabel = request.InspectionTypeLabel,
            PlanCriticalAc     = request.SamplingPlanCritical.Ac,
            PlanCriticalRe     = request.SamplingPlanCritical.Re,
            PlanMajorAc        = request.SamplingPlanMajor.Ac,
            PlanMajorRe        = request.SamplingPlanMajor.Re,
            PlanMinorAc        = request.SamplingPlanMinor.Ac,
            PlanMinorRe        = request.SamplingPlanMinor.Re,
            Decision           = request.Decision,
            DecisionReason     = request.DecisionReason,
            DefectCritical     = request.DefectCounts?.Critical ?? 0,
            DefectMajor        = request.DefectCounts?.Major ?? 0,
            DefectMinor        = request.DefectCounts?.Minor ?? 0,
            CreatedById        = request.CreatedById,
            CreatedAt          = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
        };

        try
        {
            _db.SamplingHistories.Add(entity);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            throw new Exception($"DB save failed: {msg}", ex);
        }

        return ToDto(entity);
    }

    public async Task<SamplingHistoryDto?> UpdateEvaluationAsync(Guid id, UpdateHistoryEvaluationRequest request)
    {
        var entity = await _db.SamplingHistories.FindAsync(id);
        if (entity is null) return null;

        if (request.ProductName is not null) entity.ProductName = request.ProductName;
        if (request.BatchNumber is not null) entity.BatchNumber = request.BatchNumber;
        if (request.Decision is not null) entity.Decision = request.Decision;
        if (request.DecisionReason is not null) entity.DecisionReason = request.DecisionReason;
        if (request.DefectCounts is not null)
        {
            entity.DefectCritical = request.DefectCounts.Critical;
            entity.DefectMajor = request.DefectCounts.Major;
            entity.DefectMinor = request.DefectCounts.Minor;
        }

        await _db.SaveChangesAsync();
        return ToDto(entity);
    }

    public async Task<IEnumerable<SamplingHistoryDto>> GetSamplingHistoriesAsync(int limit = 50)
    {
        var rows = await _db.SamplingHistories
            .OrderByDescending(h => h.CreatedAt)
            .Take(Math.Clamp(limit, 1, 200))
            .AsNoTracking()
            .ToListAsync();

        return rows.Select(ToDto);
    }

    public async Task<bool> DeleteSamplingHistoryAsync(Guid id)
    {
        var entity = await _db.SamplingHistories.FindAsync(id);
        if (entity is null) return false;

        _db.SamplingHistories.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<int> ClearSamplingHistoriesAsync()
    {
        return await _db.SamplingHistories.ExecuteDeleteAsync();
    }

    // ── Mapper ──────────────────────────────────────────────────────────────

    private static SamplingHistoryDto ToDto(SamplingHistory h) => new()
    {
        Id                  = h.Id,
        ProductName         = h.ProductName,
        BatchNumber         = h.BatchNumber,
        LotSize             = h.LotSize,
        LetterCode          = h.LetterCode,
        SampleSize          = h.SampleSize,
        InspectionLevel     = h.InspectionLevel,
        InspectionCode      = h.InspectionCode,
        InspectionCodeLabel = h.InspectionCodeLabel,
        InspectionTypeLabel = h.InspectionTypeLabel,
        Critical = new HistoryDefectLimit { Ac = h.PlanCriticalAc, Re = h.PlanCriticalRe },
        Major    = new HistoryDefectLimit { Ac = h.PlanMajorAc,    Re = h.PlanMajorRe    },
        Minor    = new HistoryDefectLimit { Ac = h.PlanMinorAc,    Re = h.PlanMinorRe    },
        Decision = h.Decision,
        DecisionReason = h.DecisionReason,
        DefectCounts = string.IsNullOrEmpty(h.Decision) ? null : new DefectCount
        {
            Critical = h.DefectCritical,
            Major = h.DefectMajor,
            Minor = h.DefectMinor,
        },
        CreatedAt = h.CreatedAt,
    };
}
