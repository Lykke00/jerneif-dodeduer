using DataAccess.DTO;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Service.DTO;
using Service.DTO.Deposit;
using Service.DTO.User;
using Service.Options;
using Service.Services.Files;
using DbDeposit = DataAccess.Models.Deposit;
namespace Service.Services.Deposit;

public interface IDepositService
{
    Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request); 
    Task<Result<PagedResult<GetDepositsResponse>>> GetDepositsAsync(Guid userId, PaginationRequest paginationRequest);
    Task<Result<PagedResult<GetDepositsResponse>>> GetAllDepositsAsync(AllDepositRequest request);
    Task<Result<GetDepositsResponse>> UpdateDepositStatusAsync(Guid depositId, UpdateDepositStatusRequest request);
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
    
    public async Task<Result<PagedResult<GetDepositsResponse>>> GetAllDepositsAsync(AllDepositRequest request)
    {
        IQueryable<DbDeposit> query = depositRepository.Query().Include(d => d.User);
        
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(d =>
                (d.PaymentId != null && d.PaymentId.Contains(search)) ||
                (d.User!.Email.Contains(search)) ||
                (d.User!.Id.ToString().Contains(search))
            );
        }
        
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<DbDeposit.DepositStatus>(request.Status, true, out var status))
                query = query.Where(d => d.Status.ToLower() == request.Status);
            else
            {
                return Result<PagedResult<GetDepositsResponse>>.BadRequest("status", "Invalid status filter.");
            }
        }

        var result = await depositRepository.GetPagedAsync(
            query,
            request.Page,
            request.PageSize,
            d => d.CreatedAt,
            d => new GetDepositsResponse
            {
                Id = d.Id,
                Amount = d.Amount,
                PaymentId = d.PaymentId,
                PaymentPictureUrl = d.PaymentPicture == null ? null : $"{options.Value.BackendUrl}/uploads/{d.PaymentPicture}",
                Status = d.Status,
                CreatedAt = d.CreatedAt,
                ApprovedAt = d.ApprovedAt,
                User = UserDto.FromDatabase(d.User)
            });

        return Result<PagedResult<GetDepositsResponse>>.Ok(result);
    }
    
    public async Task<Result<GetDepositsResponse>> UpdateDepositStatusAsync(Guid depositId, UpdateDepositStatusRequest request)
    {
        var deposit = await depositRepository.Query()
            .FirstOrDefaultAsync(d => d.Id == depositId);
        
        if (deposit == null)
            return Result<GetDepositsResponse>.NotFound("deposit", "Deposit not found.");

        if (!Enum.TryParse<DbDeposit.DepositStatus>(request.Status, true, out var status))
            return Result<GetDepositsResponse>.BadRequest("status", "Invalid status value.");

        deposit.StatusEnum = status;
        if (status == DbDeposit.DepositStatus.Approved)
            deposit.ApprovedAt = DateTime.UtcNow;
        await depositRepository.Update(deposit);
        
        return Result<GetDepositsResponse>.Ok(new GetDepositsResponse
        {
            Id = deposit.Id,
            Amount = deposit.Amount,
            PaymentId = deposit.PaymentId,
            PaymentPictureUrl = deposit.PaymentPicture == null ? null : $"{options.Value.BackendUrl}/uploads/{deposit.PaymentPicture}",
            Status = deposit.Status,
            CreatedAt = deposit.CreatedAt,
            ApprovedAt = deposit.ApprovedAt
        });
    }
}