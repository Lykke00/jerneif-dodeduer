using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace DataAccess;

public static class DataAccessStartupClass
{
    public static IServiceCollection DataAccessStartup(this IServiceCollection services)
    {
        services.AddScoped<IRepository<User>, UserRepository>();
        services.AddScoped<IRepository<UserLoginToken>, UserLoginTokenRepository>();
        services.AddScoped<IRepository<Deposit>, DepositRepository>();
        services.AddScoped<IRepository<UsersBalance>, UserBalanceRepository>();

        return services;
    }

}