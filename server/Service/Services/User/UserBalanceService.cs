using DataAccess;
using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;

namespace Service.Services.User;

public interface IUserBalanceService
{
    Task<decimal> GetUserBalanceAsync(Guid userId);
    Task AddDepositAsync(
        Guid userId,
        Guid depositId,
        decimal amount);
    
    Task AddPlayAsync(
        Guid userId,
        Guid playId,
        decimal amount);

}

public class UserBalanceService(AppDbContext context) : IUserBalanceService
{
    public async Task<decimal> GetUserBalanceAsync(Guid userId)
    {
        return await context.UsersBalances
            .Where(ub => ub.UserId == userId)
            .SumAsync(ub => ub.Amount);
    }
    
    public async Task AddDepositAsync(
        Guid userId,
        Guid depositId,
        decimal amount)
    {
        var userBalance = new UsersBalance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DepositId = depositId,
            BalanceEnum = UsersBalance.BalanceType.Deposit,
            Amount = amount,
            CreatedAt = DateTime.UtcNow
        };

        await context.UsersBalances.AddAsync(userBalance);
    }
    
    public async Task AddPlayAsync(
        Guid userId,
        Guid playId,
        decimal amount)
    {
        var userBalance = new UsersBalance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlayId = playId,
            BalanceEnum = UsersBalance.BalanceType.Play,
            Amount = -amount,
            CreatedAt = DateTime.UtcNow
        };

        await context.UsersBalances.AddAsync(userBalance);
    }
}