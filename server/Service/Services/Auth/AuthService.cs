using DataAccess;
using DataAccess.Models;
using Service.DTO.Auth;
using Service.DTO.Auth.Login;

namespace Service.Services.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, AgentDto agentDto);
}

public class AuthService(AppDbContext context) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, AgentDto agentDto)
    {
        var user = await context.Users.FindAsync(request.Email);
        if (user is null)
            throw new Exception("User not found");

        // skal sendes med email
        var raw = TokenService.GenerateRawToken();
        
        // skal gemmes i databasen sammen med user
        var hash = TokenService.ComputeHash(raw);
        
        var userToken = new UserLoginToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            RequestedIp = agentDto.IpAddress,
            RequestedUserAgent = agentDto.UserAgent
        };
        
        context.UserLoginTokens.Add(userToken);
        await context.SaveChangesAsync();
        
        throw new NotImplementedException();
    }
}