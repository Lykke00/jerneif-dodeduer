using Api.Rest.Extensions;
using Api.Rest.Http;
using DataAccess;
using DataAccess.Models;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NSwag;
using NSwag.Generation.Processors.Security;
using Serilog;
using Service.Options;
using Service.Services.Auth;

namespace Api.Rest;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddSingleton(_ => TimeProvider.System);
        
        builder.Logging.ClearProviders();
        ConfSerilog.Configure();
        builder.Host.UseSerilog();
        
        builder.AddAppOptions();

        //builder.AddPgContainer();
        var options = builder.Configuration.GetSection(nameof(AppOptions)).Get<AppOptions>()!;


        builder.Services.AddDbContext<AppDbContext>(config =>
        {
            config.UseNpgsql(options.DbConnectionString);
            config.EnableSensitiveDataLogging();
        });
        
        //----------------- services registration ----------------- \\
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddSingleton<IJwtGenerator, JwtGenerator>();
        //--------------------------------------------------------- \\
        
        //------------------- API registration -------------------- \\
        builder.Services.AddSingleton<ICookieService, CookieService>();
        //--------------------------------------------------------- \\
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddOpenApiDocument(configuration =>
        {
            {
                configuration.AddSecurity("JWT", Enumerable.Empty<string>(), new OpenApiSecurityScheme
                {
                    Type = OpenApiSecuritySchemeType.ApiKey,
                    Scheme = "Bearer ",
                    Name = "Authorization",
                    In = OpenApiSecurityApiKeyLocation.Header,
                    Description = "Type into the textbox: Bearer {your JWT token}."
                });
                //configuration.AddTypeToSwagger<T>(); //If you need to add some type T to the Swagger known types
                configuration.DocumentProcessors.Add(new MakeAllPropertiesRequiredProcessor());

                configuration.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
            }
        });


        var app = builder.Build();

        app.UseHttpsRedirection();

        app.UseRouting();
        app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

        app.UseOpenApi();
        app.UseSwaggerUi();
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                context.Request.Headers["Authorization"] = string.Empty;
            }
            await next();
        });
        app.UseAuthentication();
        app.UseAuthorization();
        
        app.MapControllers();
        app.UseStatusCodePages();
              
        app.Run();
    }
}