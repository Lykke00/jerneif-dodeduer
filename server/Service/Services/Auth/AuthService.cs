using DataAccess;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.Auth;
using Service.DTO.Auth.Login;
using Service.DTO.Auth.Verify;

namespace Service.Services.Auth;

public interface IAuthService
{
    Task<Result<bool>> LoginAsync(LoginRequest request, AgentDto agentDto);
    Task<Result<LoginVerifyResponse>> VerifyAsync(LoginVerifyRequest request, AgentDto agentDto);
}

public class AuthService(AppDbContext context, IJwtGenerator jwtGenerator) : IAuthService
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
        
        Console.WriteLine(raw);
        
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
    
    public async Task<Result<LoginVerifyResponse>> VerifyAsync(LoginVerifyRequest request, AgentDto agentDto)
    {
        var hash = Base64UrlTokenHelper.ComputeHash(request.Token);

        var token = await context.UserLoginTokens
            .SingleOrDefaultAsync(t => t.TokenHash == hash);
        
        if (token == null || token.UsedAt != null || token.ExpiresAt <= DateTime.UtcNow)
            return Result<LoginVerifyResponse>.ValidationError("Ugyldig eller udløbet token.");
        
        var user = await context.Users
            .SingleOrDefaultAsync(u => u.Id == token.UserId);
        if (user == null)
            return Result<LoginVerifyResponse>.NotFound("Brugeren eksisterer ikke.");
        
        token.UsedAt = DateTime.UtcNow;
        token.ConsumedIp = agentDto.IpAddress;
        token.ConsumedUserAgent = agentDto.UserAgent;
        
        context.UserLoginTokens.Update(token);
        
        await context.SaveChangesAsync();
        var jwt = jwtGenerator.GenerateTokenPair(user);
        var response = new LoginVerifyResponse
        {
            Jwt = jwt
        };
        
        return Result<LoginVerifyResponse>.Ok(response);
    }
}