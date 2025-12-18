using DataAccess;
using DataAccess.Models;
using Service.DTO.Game;

namespace tests.Helpers;

public static class TestDataFactory
{
    public static async Task<User>  CreateUserAsync(
        AppDbContext db,
        string email)
    {
        var user = new User
        {
            FirstName = "Test",
            LastName = "User",
            Phone =  "1234567890",
            Email = email
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }
}