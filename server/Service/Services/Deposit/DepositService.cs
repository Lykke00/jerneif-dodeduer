using DataAccess.Repository;
using Service.DTO;
using Service.DTO.Deposit;
using Service.Services.Files;
using DbDeposit = DataAccess.Models.Deposit;
namespace Service.Services.Deposit;

public interface IDepositService
{
    Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request);   
}

public class DepositService(IRepository<DbDeposit> depositRepository, IFileService fileService) : IDepositService
{
    public async Task<Result<DepositResponse>> DepositAsync(Guid userId, DepositRequest request)
    {
        var picture = request.PaymentPicture;
        string? storedPicture = null;
        if (picture != null)
        {
            storedPicture = await fileService.SaveAsync(
                picture,
                request.PaymentPictureFileName);
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
            PaymentId = deposit.PaymentId,
            PaymentPictureUrl = "",
            Status = deposit.Status,
            CreatedAt = deposit.CreatedAt
        });
    }
}