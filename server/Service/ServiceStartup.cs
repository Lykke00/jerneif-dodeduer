using DataAccess;
using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Resend;
using Service.Options;
using Service.Services.Auth;
using Service.Services.Deposit;
using Service.Services.Email;
using Service.Services.Files;
using Service.Services.User;

namespace Service;

public static class ServiceStartupClass
{
    public static IServiceCollection ServiceStartup(this IServiceCollection services)
    {
        services.DataAccessStartup();

        /* resend */
        services.AddOptions();
        services.AddHttpClient<ResendClient>();
        services.AddOptions<ResendClientOptions>()
            .Configure<IOptions<AppOptions>>((resendOpts, appOpts) =>
            {
                resendOpts.ApiToken = appOpts.Value.ResendApiKey;
            });
        
        services.AddTransient<IResend, ResendClient>();
        
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddSingleton<IJwtGenerator, JwtGenerator>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDepositService, DepositService>();
        services.AddScoped<IFileService, FileService>();
        
        return services;
    }

}