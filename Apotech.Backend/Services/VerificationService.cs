using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Services;

public interface IVerificationService
{
    Task<ProblemVerification> CreateAsync(CreateVerificationRequest request, string? createdById);
    Task<IEnumerable<ProblemVerification>> ListRecentAsync(int limit);
}

public class VerificationService : IVerificationService
{
    private readonly AppDbContext _context;

    public VerificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProblemVerification> CreateAsync(CreateVerificationRequest request, string? createdById)
    {
        var verification = new ProblemVerification
        {
            Id = Guid.NewGuid().ToString("N"),
            Date = request.Date,
            ProductCode = request.ProductCode,
            BatchNumber = request.BatchNumber,
            Location = request.Location,
            AqlCriteria = request.AqlCriteria,
            UnitType = request.UnitType,
            GeneralLevel = request.GeneralLevel,
            SampleSize = request.SampleSize,
            Keterangan = request.Keterangan,
            Kesimpulan = request.Kesimpulan,
            CreatedById = createdById,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var position = 1;
        foreach (var findingDto in request.Findings)
        {
            verification.ProblemFindings.Add(new ProblemFinding
            {
                Id = Guid.NewGuid().ToString("N"),
                Position = position++,
                Label = findingDto.Label,
                ContainerType = findingDto.ContainerType,
                FindingCount = findingDto.FindingCount,
                Description = findingDto.Description,
                CreatedAt = DateTime.UtcNow
            });
        }

        _context.ProblemVerifications.Add(verification);
        await _context.SaveChangesAsync();
        return verification;
    }

    public async Task<IEnumerable<ProblemVerification>> ListRecentAsync(int limit)
    {
        return await _context.ProblemVerifications
            .Include(v => v.ProblemFindings.OrderBy(f => f.Position))
            .OrderByDescending(v => v.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }
}
