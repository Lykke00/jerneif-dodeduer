using Api.Rest.Extensions;
using Api.Rest.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.Auth;
using Service.DTO.Auth.Login;
using Service.DTO.Auth.Verify;
using Service.DTO.User;
using Service.Services.Auth;
using Service.Services.User;
using LoginRequest = Service.DTO.Auth.Login.LoginRequest;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService service, IUserService userService, ICookieService cookieService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<Result<bool>> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var agent = new AgentDto
        {
            IpAddress = ip ?? "unknown",
            UserAgent = userAgent
        };

        return await service.LoginAsync(request, agent);
    }

    [HttpPost("verify")]
    public async Task<Result<string>> Verify([FromBody] LoginVerifyRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var agent = new AgentDto
        {
            IpAddress = ip ?? "unknown",
            UserAgent = userAgent
        };

        var result = await service.VerifyAsync(request, agent);
        if (!result.Success)
            return Result<string>.FromResult(result);
        
        if (result.Value is null)
            return Result<string>.InternalError("Unexpected null value from service.");
        
        var jwtResult = result.Value;
        cookieService.SetRefreshTokenCookie(HttpContext, jwtResult.Jwt);
        return Result<string>.Ok(jwtResult.Jwt.AccessToken);
    }
    
    [HttpPost("refresh")]
    public async Task<Result<string>> Refresh()
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        var agent = new AgentDto
        {
            IpAddress = ip ?? "unknown",
            UserAgent = userAgent
        };

        var refreshToken = Request.Cookies["token"];
        if (string.IsNullOrWhiteSpace(refreshToken))
            return Result<string>.Unauthorized("No refresh token cookie.");

        var result = await service.RefreshAsync(refreshToken, agent);
        if (!result.Success)
            return Result<string>.FromResult(result);
        
        if (result.Value is null)
            return Result<string>.InternalError("Unexpected null value from service.");
        
        var jwtResult = result.Value;
        cookieService.SetRefreshTokenCookie(HttpContext, jwtResult.Jwt);
        return Result<string>.Ok(jwtResult.Jwt.AccessToken);
    }
    
    [HttpPost("logout")]
    public async Task<Result<bool>> Logout()
    {
        cookieService.ClearRefreshToken(HttpContext);
        return await Task.FromResult(Result<bool>.Ok(true));
    }
    
    [Authorize]
    [HttpGet("me")]
    public async Task<Result<UserDto>> Me()
    {
        var id = User.GetUserId();
        if (id == null) return Result<UserDto>.Unauthorized("Not logged in");

        return await userService.GetByIdAsync(id.Value);
    }
}