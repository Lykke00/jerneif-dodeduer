using DataAccess;
using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.Extensions.DependencyInjection;
using Service.Services.Auth;
using Service.Services.User;

namespace Service;

public static class ServiceStartupClass
{
    public static IServiceCollection ServiceStartup(this IServiceCollection services)
    {
        services.DataAccessStartup();

        services.AddScoped<IAuthService, AuthService>();
        services.AddSingleton<IJwtGenerator, JwtGenerator>();
        services.AddScoped<IUserService, UserService>();
        
        return services;
    }

}