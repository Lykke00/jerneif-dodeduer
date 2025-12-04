using System.IdentityModel.Tokens.Jwt;

namespace Service.Services.Auth;

public static class JwtValidator
{
    public static Guid? ValidateRefreshToken(string refreshToken)
    {
        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(refreshToken);

        if (token.Claims.FirstOrDefault(c => c.Type == "typ")?.Value != "refresh")
            return null;

        var sub = token.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub)?.Value;
        return sub != null ? Guid.Parse(sub) : null;
    }
}