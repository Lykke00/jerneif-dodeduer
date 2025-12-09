using Api.Rest.Extensions;
using Api.Rest.Requests;
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
        //var userId = User.GetUserId();
        //if (userId == null) return Result<DepositResponse>.Unauthorized("Not logged in");

        Guid userId = Guid.Parse("0d76d9e0-a6ae-4c82-b4c8-c4f30c4459b5");
        
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
        
        return await depositService.DepositAsync(userId, newRequest);
    }
}