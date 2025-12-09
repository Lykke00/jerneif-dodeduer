using DataAccess.DTO;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Service.DTO;
using Service.DTO.Deposit;
using Service.Options;
using Service.Services.Files;
using DbDeposit = DataAccess.Models.Deposit;
namespace Service.Services.Deposit;

public interface IDepositService
{
    Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request); 
    Task<Result<PagedResult<GetDepositsResponse>>> GetDepositsAsync(Guid userId, PaginationRequest paginationRequest);
}

public class DepositService(IRepository<DbDeposit> depositRepository, IFileService fileService, IOptions<AppOptions> options) : IDepositService
{
    public async Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request)
    {
        var picture = request.PaymentPicture;
        var originalFileName = request.PaymentPictureFileName;
        string? storedPicture = null;
        if (picture != null && originalFileName != null)
        {
            storedPicture = await fileService.SaveAsync(
                picture,
                originalFileName);
        }
        
        var deposit = new DbDeposit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = request.Amount,
            PaymentId = request.PaymentId,
            PaymentPicture = storedPicture,
            StatusEnum = DbDeposit.DepositStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await depositRepository.Add(deposit);
        
        return Result<DepositResponse>.Ok(new DepositResponse
        {
            Id = deposit.Id,
            Amount = deposit.Amount,
            PaymentId = deposit.PaymentId ?? null,
            PaymentPictureUrl = "",
            Status = deposit.Status,
            CreatedAt = deposit.CreatedAt
        });
    }
    
    public async Task<Result<PagedResult<GetDepositsResponse>>> GetDepositsAsync(
        Guid userId,
        PaginationRequest paginationRequest)
    {
        var query = depositRepository.Query()
            .Where(d => d.UserId == userId);

        var result = await depositRepository.GetPagedAsync(
            query,
            paginationRequest.Page,
            paginationRequest.PageSize,
            d => d.CreatedAt,
            d => new GetDepositsResponse
            {
                Id = d.Id,
                Amount = d.Amount,
                PaymentId = d.PaymentId,
                PaymentPictureUrl = d.PaymentPicture == null ? null : $"{options.Value.BackendUrl}/uploads/{d.PaymentPicture}",
                Status = d.Status,
                CreatedAt = d.CreatedAt,
                ApprovedAt = d.ApprovedAt
            });

        return Result<PagedResult<GetDepositsResponse>>.Ok(result);
    }
}