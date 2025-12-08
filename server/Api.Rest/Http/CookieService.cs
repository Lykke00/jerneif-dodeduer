using Microsoft.Extensions.Options;
using Service.Models;
using Service.Options;

namespace Api.Rest.Http;

public interface ICookieService
{
    void SetRefreshTokenCookie(HttpContext http, JwtPair tokens);
    void ClearRefreshToken(HttpContext http);
}

public class CookieService : ICookieService
{
    private readonly IWebHostEnvironment _env;
    private readonly AppOptions _options;

    public CookieService(IWebHostEnvironment env, IOptions<AppOptions> options)
    {
        _env = env;
        _options = options.Value;
    }

    public void SetRefreshTokenCookie(HttpContext http, JwtPair tokens)
    {
        var domain = new Uri(_options.FrontendUrl).Host;

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            SameSite = _env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.None,
            Secure = !_env.IsDevelopment(),
            Expires = tokens.RefreshTokenExpiresAt
        };
        
        if (!_env.IsDevelopment())
        {
            cookieOptions.Domain = "." + domain;
        }

        http.Response.Cookies.Append("token", tokens.RefreshToken!, cookieOptions);
    }

    public void ClearRefreshToken(HttpContext http)
    {
        http.Response.Cookies.Delete("token");
    }
}
