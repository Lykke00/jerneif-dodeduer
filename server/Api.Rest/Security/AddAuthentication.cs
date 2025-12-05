using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Service.DTO;
using Service.Options;

namespace Api.Rest.Security;

public static class AddAuthenticationClass
{
    public static IServiceCollection AddAuthentication(this IServiceCollection services, JwtOptions jwtOptions)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtOptions.Issuer,
                ValidAudience = jwtOptions.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtOptions.Secret)
                ),
                
                // validering skal udløbe præcist på det angivne tidspunkt
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnChallenge = async context =>
                {
                    // stop default behavior
                    context.HandleResponse();

                    // hvis responsen allerede er startet, så gør ikke mere
                    if (context.Response.HasStarted)
                    {
                        return;
                    }

                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";

                    var result = Result<string>.Unauthorized("Unauthorized", "Invalid or missing token");

                    await context.Response.WriteAsJsonAsync(result);
                },

                OnForbidden = async context =>
                {
                    if (context.Response.HasStarted)
                        return;

                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    context.Response.ContentType = "application/json";

                    var result = Result<string>.Forbidden("Forbidden", "You do not have access");

                    await context.Response.WriteAsJsonAsync(result);
                },
            };
        });

        services.AddAuthorization();
        return services;
    }

}