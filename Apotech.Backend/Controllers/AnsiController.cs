using Apotech.Backend.DTOs;
using Apotech.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Apotech.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnsiController : ControllerBase
{
    private readonly IAnsiService _ansiService;

    public AnsiController(IAnsiService ansiService)
    {
        _ansiService = ansiService;
    }
    [HttpPost("sampling-plan")]
    public IActionResult CalculateSamplingPlan([FromBody] SamplingRequest request)
    {
        try
        {
            var result = _ansiService.CalculateSamplingPlan(request);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    [HttpPost("evaluate")]
    public IActionResult Evaluate([FromBody] EvaluationRequest request)
    {
        try
        {
            var result = _ansiService.EvaluateDefects(request);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    [HttpGet("references")]
    public IActionResult References()
    {
        return Ok(new { success = true, data = _ansiService.GetReferenceTables() });
    }
}
