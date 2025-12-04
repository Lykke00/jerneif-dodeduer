using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository;

public class UserRepository(AppDbContext context) : BaseRepository<User>(context)
{
    protected override DbSet<User> Set => Context.Set<User>();
}