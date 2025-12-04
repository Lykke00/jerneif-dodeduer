using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository;

public class UserLoginTokenRepository(AppDbContext context) : BaseRepository<UserLoginToken>(context)
{
    protected override DbSet<UserLoginToken> Set => Context.Set<UserLoginToken>();
}