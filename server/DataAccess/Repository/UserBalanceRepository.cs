using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository;

public class UserBalanceRepository(AppDbContext context) : BaseRepository<UsersBalance>(context)
{
    protected override DbSet<UsersBalance> Set => Context.Set<UsersBalance>();
}