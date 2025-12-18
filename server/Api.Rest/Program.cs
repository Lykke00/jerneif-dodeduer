using Api.Rest.Extensions;
using Api.Rest.Http;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Service;
using Service.Options;
using Api.Rest.Controllers;
using Api.Rest.Documentation;
using Api.Rest.Middleware;
using Api.Rest.Security;
using FluentValidation;


namespace Api.Rest;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddSingleton(_ => TimeProvider.System);

        builder.Logging.ClearProviders();
        ConfSerilog.Configure();
        builder.Host.UseSerilog();

        builder.AddAppOptions();

        var appOptions = builder.Configuration
            .GetSection(nameof(AppOptions))
            .Get<AppOptions>()!;
        var jwtOptions = appOptions.Jwt;

        if (builder.Environment.IsEnvironment("Testing"))
        {
            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });
        }
        else
        {
            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseNpgsql(appOptions.DbConnectionString);
                options.EnableSensitiveDataLogging();
            });
        }

        //---------------- SERVICES ----------------//
        builder.Services.ServiceStartup();
        builder.Services.AddSingleton<ICookieService, CookieService>();

        //---------------- AUTHENTICATION ----------//
        builder.Services.AddAuthentication(jwtOptions);
        
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("Frontend", p =>
            {
                p.WithOrigins(appOptions.FrontendUrl)
                    .AllowCredentials()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        //---------------- API ---------------------//
        builder.Services.AddControllers(options =>
        {
            options.Filters.Add<ValidationFilter>();
        });

        builder.Services.AddScoped<ValidationFilter>();
        
        builder.Services.AddApiDocumentation();
        
        builder.Services.AddValidatorsFromAssemblyContaining<AuthController>();
        
        var app = builder.Build();

        //---------------- MIDDLEWARE --------------//
        app.UseHttpsRedirection();
        
        // bruges til oprettelse af biler
        app.UseStaticFiles();

        app.UseRouting();
        app.UseCors("Frontend");

        app.UseOpenApi();
        app.UseSwaggerUi();

        // Swagger should not reuse the Authorization header
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
        
        app.UseMiddleware<ResultMiddleware>();
        
        app.MapControllers();
        app.UseStatusCodePages();
        
        await app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts");

        await app.RunAsync();
    }
}
