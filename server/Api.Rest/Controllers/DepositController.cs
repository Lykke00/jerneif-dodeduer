using Api.Rest.Extensions;
using Api.Rest.Requests;
using DataAccess.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.Deposit;
using Service.DTO.User;
using Service.Services.Deposit;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepositController(IDepositService depositService) : ControllerBase
{
    [HttpPost("create")]
    [Authorize]
    public async Task<Result<DepositResponse>> CreateDeposit([FromForm] DepositCreateRequest request)
    {
        var userId = User.GetUserId();
        if (userId == null) return Result<DepositResponse>.Unauthorized("Not logged in");
        
        Stream? stream = null;
        string fileName = "";
        if (request.PaymentPicture != null)
        {
            stream = request.PaymentPicture.OpenReadStream();
            fileName = request.PaymentPicture.FileName;
        }
        
        var newRequest = new DepositRequest
        {
            Amount = request.Amount,
            PaymentId = request.PaymentId,
            PaymentPicture = stream,
            PaymentPictureFileName = fileName
        };
        
        return await depositService.DepositAsync(userId.Value, newRequest);
    }
    
    [HttpGet("deposits")]
    [Authorize]
    public async Task<Result<PagedResult<GetDepositsResponse>>> GetDeposits([FromQuery] PaginationRequest paginationRequest)
    {
        var userId = User.GetUserId();
        if (userId == null) return Result<PagedResult<GetDepositsResponse>>.Unauthorized("Not logged in");
        
        return await depositService.GetDepositsAsync(userId.Value, paginationRequest);
    }
    
    [Authorize(Roles = "admin")]
    [HttpGet("all")]
    public async Task<Result<PagedResult<GetDepositsResponse>>> GetAllDeposits([FromQuery] AllDepositRequest paginationRequest)
    {
        var userId = User.GetUserId();
        if (userId == null) return Result<PagedResult<GetDepositsResponse>>.Unauthorized("Not logged in");

        return await depositService.GetAllDepositsAsync(paginationRequest);
    }
}