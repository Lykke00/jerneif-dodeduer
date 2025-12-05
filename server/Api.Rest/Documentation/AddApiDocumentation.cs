using Api.Rest.Extensions;
using NSwag;
using NSwag.Generation.Processors.Security;

namespace Api.Rest.Documentation;

public static class AddDocumentationClass
{
    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();

        services.AddOpenApiDocument(configuration =>
        {
            configuration.AddSecurity("JWT", Enumerable.Empty<string>(), new OpenApiSecurityScheme
            {
                Type = OpenApiSecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                Name = "Authorization",
                In = OpenApiSecurityApiKeyLocation.Header,
                Description = "Type into the textbox: Bearer {your JWT token}."
            });

            configuration.DocumentProcessors.Add(new MakeAllPropertiesRequiredProcessor());
            configuration.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
        });

        return services;
    }
}
