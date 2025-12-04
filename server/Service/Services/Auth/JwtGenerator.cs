using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DataAccess.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Service.Models;
using Service.Options;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;
using DbUser = DataAccess.Models.User;

namespace Service.Services.Auth;

public interface IJwtGenerator
{
    JwtPair GenerateTokenPair(DbUser user);
}

public class JwtGenerator(IOptions<AppOptions> appOptions) : IJwtGenerator
{
    private readonly JwtOptions _options = appOptions.Value.Jwt;

    public JwtPair GenerateTokenPair(DbUser user)
    {
        var now = DateTime.UtcNow;

        var accessExpires = now.AddMinutes(_options.AccessTokenMinutes);
        var accessToken = GenerateJwt(
            user: user,
            expires: accessExpires,
            audience: _options.Audience,
            issuer: _options.Issuer,
            includeJti: true
        );

        var refreshExpires = now.AddDays(_options.RefreshTokenDays);
        var refreshToken = GenerateJwt(
            user: user,
            expires: refreshExpires,
            audience: _options.Audience,
            issuer: _options.Issuer,
            includeJti: true,
            isRefreshToken: true
        );

        return new JwtPair
        {
            AccessToken = accessToken,
            AccessTokenExpiresAt = accessExpires,
            RefreshToken = refreshToken,
            RefreshTokenExpiresAt = refreshExpires
        };
    }

    private string GenerateJwt(
        DbUser user,
        DateTime expires,
        string audience,
        string issuer,
        bool includeJti,
        bool isRefreshToken = false)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("admin", user.Admin.ToString().ToLower()),
        };

        if (includeJti)
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));

        if (isRefreshToken)
            claims.Add(new Claim("typ", "refresh"));
        else
            claims.Add(new Claim("typ", "access"));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
