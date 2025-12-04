using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.Auth;
using Service.DTO.Auth.Login;
using Service.Services.Auth;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService service) : ControllerBase
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

}