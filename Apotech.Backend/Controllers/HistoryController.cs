using Apotech.Backend.DTOs;
using Apotech.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Apotech.Backend.Controllers;

/// <summary>
/// Riwayat Kalkulasi Sampling Plan
///
/// POST   /api/history/sampling           → simpan 1 entry baru
/// GET    /api/history/sampling           → ambil daftar (query: limit, default 50)
/// DELETE /api/history/sampling/{id}      → hapus 1 entry
/// DELETE /api/history/sampling           → hapus semua
/// </summary>
[ApiController]
[Route("api/history")]
public class HistoryController : ControllerBase
{
    private readonly IHistoryService _historyService;

    public HistoryController(IHistoryService historyService)
    {
        _historyService = historyService;
    }

    // POST /api/history/sampling
    [HttpPost("sampling")]
    public async Task<IActionResult> Save([FromBody] SaveHistoryRequest request)
    {
        try
        {
            var result = await _historyService.SaveSamplingHistoryAsync(request);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    // PUT /api/history/sampling/{id}
    [HttpPut("sampling/{id:guid}")]
    public async Task<IActionResult> UpdateEvaluation(Guid id, [FromBody] UpdateHistoryEvaluationRequest request)
    {
        try
        {
            var result = await _historyService.UpdateEvaluationAsync(id, request);
            if (result is null)
                return NotFound(new { success = false, error = "Entry tidak ditemukan" });

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    // GET /api/history/sampling?limit=50
    [HttpGet("sampling")]
    public async Task<IActionResult> GetAll([FromQuery] int limit = 50)
    {
        try
        {
            var items = await _historyService.GetSamplingHistoriesAsync(limit);
            return Ok(new { success = true, data = items });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    // DELETE /api/history/sampling/{id}
    [HttpDelete("sampling/{id:guid}")]
    public async Task<IActionResult> DeleteOne(Guid id)
    {
        try
        {
            var deleted = await _historyService.DeleteSamplingHistoryAsync(id);
            if (!deleted)
                return NotFound(new { success = false, error = "Entry tidak ditemukan" });

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }

    // DELETE /api/history/sampling
    [HttpDelete("sampling")]
    public async Task<IActionResult> ClearAll()
    {
        try
        {
            var count = await _historyService.ClearSamplingHistoriesAsync();
            return Ok(new { success = true, deleted = count });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}
