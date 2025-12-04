using DataAccess;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.Auth;
using Service.DTO.Auth.Login;

namespace Service.Services.Auth;

public interface IAuthService
{
    Task<Result<bool>> LoginAsync(LoginRequest request, AgentDto agentDto);
}

public class AuthService(AppDbContext context) : IAuthService
{
    public async Task<Result<bool>> LoginAsync(LoginRequest request, AgentDto agentDto)
    {
        // vi tjekker i databasen om brugeren eksisterer
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Email == request.Email);
        
        // hvis brugeren er null, så smider vi en fejl
        if (user is null)
            return Result<bool>.NotFound("Brugeren eksisterer ikke.");

        // opret en rå token der skal sendes til email
        var raw = TokenService.GenerateRawToken();
        
        // opret en hash token fra den rå token til at gemme i databasen
        var hash = TokenService.ComputeHash(raw);
        
        // opret en bruger login token til at gemme i databasen
        // så kan vi senere validere den når brugeren klikker på linket i emailen
        var userToken = new UserLoginToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            RequestedIp = agentDto.IpAddress,
            RequestedUserAgent = agentDto.UserAgent
        };
        
        // gem bruger login token i databasen
        context.UserLoginTokens.Add(userToken);
        
        // gem ændringer i databasen
        await context.SaveChangesAsync();
        
        return Result<bool>.Ok(true);
    }
}