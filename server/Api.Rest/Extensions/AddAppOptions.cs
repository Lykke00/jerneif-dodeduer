using Service.Options;

namespace Api.Rest.Extensions;

public static class AddAppOptionsExtension
{
    public static WebApplicationBuilder AddAppOptions(this WebApplicationBuilder builder)
    {
        builder.Services.AddOptionsWithValidateOnStart<AppOptions>()
            .Bind(builder.Configuration.GetSection(nameof(AppOptions)));
        
        return builder;
    }
}