using Apotech.Backend.DTOs;
using Apotech.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Apotech.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VerificationController : ControllerBase
{
    private readonly IVerificationService _verificationService;

    public VerificationController(IVerificationService verificationService)
    {
        _verificationService = verificationService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVerificationRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var verification = await _verificationService.CreateAsync(request, userId);
            return StatusCode(201, new { success = true, data = verification });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetRecent()
    {
        try
        {
            var data = await _verificationService.ListRecentAsync(20);
            return Ok(new { success = true, data });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}
