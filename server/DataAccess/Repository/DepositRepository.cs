using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository;

public class DepositRepository(AppDbContext context) : BaseRepository<Deposit>(context)
{
    protected override DbSet<Deposit> Set => Context.Set<Deposit>();
}