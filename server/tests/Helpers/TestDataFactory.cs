using DataAccess;
using DataAccess.Models;
using Service.DTO.Game;

namespace tests.Helpers;

public static class TestDataFactory
{
    public static async Task<User>  CreateUserAsync(
        AppDbContext db,
        string email,
        bool active = true)
    {
        var user = new User
        {
            FirstName = "Test",
            LastName = "User",
            Phone =  "1234567890",
            Active = active,
            Email = email
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public static async Task<UsersBalance> UpdateBalanceAsync(
        AppDbContext db,
        Guid userId,
        int amount)
    {
        var newBalance = new UsersBalance
        {
            UserId = userId,
            Amount = amount,
            BalanceEnum = UsersBalance.BalanceType.Deposit,
            CreatedAt = DateTime.UtcNow,
        };
        
        db.UsersBalances.Add(newBalance);
        await db.SaveChangesAsync();
        return newBalance;
    }
}