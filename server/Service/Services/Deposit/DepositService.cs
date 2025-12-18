using DataAccess;
using DataAccess.DTO;
using DataAccess.Querying;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Service.DTO;
using Service.DTO.Deposit;
using Service.DTO.User;
using Service.Options;
using Service.Services.Files;
using Service.Services.User;
using DbDeposit = DataAccess.Models.Deposit;
namespace Service.Services.Deposit;

public interface IDepositService
{
    Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request); 
    Task<Result<PagedResult<GetDepositsResponse>>> GetDepositsAsync(Guid userId, PaginationRequest paginationRequest);
    Task<Result<PagedResult<GetDepositsResponse>>> GetAllDepositsAsync(AllDepositRequest request);
    Task<Result<GetDepositsResponse>> UpdateDepositStatusAsync(Guid depositId, UpdateDepositStatusRequest request);
}

public class DepositService(AppDbContext context, IUserBalanceService userBalanceService, IFileService fileService, IOptions<AppOptions> options) : IDepositService
{
    public async Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request)
    {
        var picture = request.PaymentPicture;
        var originalFileName = request.PaymentPictureFileName;
        string? storedPicture = null;
        
        // hvis billedet ikke er null og originalfil navn ikke er null
        // så går vi udfra der er et billede der skal gemmes
        if (picture != null && originalFileName != null)
        {
            // opdater vores null variable med billedets GUID.jpg
            storedPicture = await fileService.SaveAsync(
                picture,
                originalFileName);
        }
        
        // opret en ny deposit
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

        // gem den i databasen
        await context.Deposits.AddAsync(deposit);
        await context.SaveChangesAsync();
        
        // returner svaret til brugeren
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
        // få fat i resultat hvor brugerid = brugerens id
        var result = await context.Deposits
            .Where(d => d.UserId == userId)
            // her får vi fat i paginated resultater, altså med side og total.
            .ToPagedAsync(
                paginationRequest.Page,
                paginationRequest.PageSize,
                d => d.CreatedAt,
                d => new GetDepositsResponse
                {
                    Id = d.Id,
                    Amount = d.Amount,
                    PaymentId = d.PaymentId,
                    PaymentPictureUrl = d.PaymentPicture == null
                        ? null
                        : $"{options.Value.BackendUrl}/uploads/{d.PaymentPicture}",
                    Status = d.Status,
                    CreatedAt = d.CreatedAt,
                    ApprovedAt = d.ApprovedAt
                });

        // returner til brugeren
        return Result<PagedResult<GetDepositsResponse>>.Ok(result);
    }
    
    public async Task<Result<PagedResult<GetDepositsResponse>>> GetAllDepositsAsync(
        AllDepositRequest request)
    {
        // start med at lave n query hvor vi inkluderer/joiner brugeren
        IQueryable<DbDeposit> query = context.Deposits
            .AsNoTracking()
            .Include(d => d.User);

        // hvis search ikke er tom
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = $"%{request.Search.Trim()}%";

            // søg efter paymentID eller hvor brugerens mail
            query = query.Where(d =>
                (d.PaymentId != null && EF.Functions.ILike(d.PaymentId, search)) ||
                EF.Functions.ILike(d.User!.Email, search)
            );
        }

        // hvis status ikke er tom
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            // prøv at parse enum først, den måde sikrer vi konsistens
            if (!Enum.TryParse<DbDeposit.DepositStatus>(
                    request.Status, true, out var status))
            {
                return Result<PagedResult<GetDepositsResponse>>
                    .BadRequest("status", "Invalid status filter.");
            }

            // sæg efter enums med denne, f.eks: approved, declined, pending.
            query = query.Where(d => d.StatusEnum == status);
        }

        // returner til brugeren
        var result = await query.ToPagedAsync(
            request.Page,
            request.PageSize,
            d => d.CreatedAt,
            d => new GetDepositsResponse
            {
                Id = d.Id,
                Amount = d.Amount,
                PaymentId = d.PaymentId,
                PaymentPictureUrl = d.PaymentPicture == null
                    ? null
                    : $"{options.Value.BackendUrl}/uploads/{d.PaymentPicture}",
                Status = d.Status,
                CreatedAt = d.CreatedAt,
                ApprovedAt = d.ApprovedAt,
                User = UserDto.FromDatabase(d.User!)
            });

        return Result<PagedResult<GetDepositsResponse>>.Ok(result);
    }
    
    public async Task<Result<GetDepositsResponse>> UpdateDepositStatusAsync(Guid depositId, UpdateDepositStatusRequest request)
    {
        // få fat i deposit og inkluder/join brugeren på, få fat i hvor depositId = request id.
        var deposit = await context.Deposits
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == depositId);
        
        // hvis deposit er null, så eksisterer den ikke
        if (deposit == null)
            return Result<GetDepositsResponse>.NotFound("deposit", "Deposit not found.");

        // hvis status ikke kan parses/laves om til enum, så er det ugyldigt
        if (!Enum.TryParse<DbDeposit.DepositStatus>(request.Status, true, out var status))
            return Result<GetDepositsResponse>.BadRequest("status", "Invalid status value.");

        // opdater deposits status
        deposit.StatusEnum = status;
        
        // hvis det er en approved, så skal vi lige have lidt ekstre felter opdateret
        if (status == DbDeposit.DepositStatus.Approved)
        {
            deposit.ApprovedAt = DateTime.UtcNow;

            await userBalanceService.AddDepositAsync(
                deposit.UserId,
                deposit.Id,
                deposit.Amount);
        }

        // opdater i databasen
        context.Deposits.Update(deposit);
        await context.SaveChangesAsync();
        
        // returner til brugeren
        return Result<GetDepositsResponse>.Ok(new GetDepositsResponse
        {
            Id = deposit.Id,
            Amount = deposit.Amount,
            PaymentId = deposit.PaymentId,
            PaymentPictureUrl = deposit.PaymentPicture == null ? null : $"{options.Value.BackendUrl}/uploads/{deposit.PaymentPicture}",
            Status = deposit.Status,
            CreatedAt = deposit.CreatedAt,
            ApprovedAt = deposit.ApprovedAt,
            User = UserDto.FromDatabase(deposit.User)
        });
    }
}