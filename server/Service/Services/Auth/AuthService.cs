using DataAccess;
using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.Auth;
using Service.DTO.Auth.Login;
using Service.DTO.Auth.Verify;
using Service.DTO.User;
using Service.Services.Email;
using DbUser = DataAccess.Models.User;
namespace Service.Services.Auth;

public interface IAuthService
{
    Task<Result<bool>> LoginAsync(LoginRequest request, AgentDto agentDto);
    Task<Result<LoginVerifyResponse>> VerifyAsync(LoginVerifyRequest request, AgentDto agentDto);
    Task<Result<LoginVerifyResponse>> RefreshAsync(string refreshToken, AgentDto agentDto);
}

public class AuthService(IJwtGenerator jwtGenerator, IRepository<DbUser> userRepository, IRepository<UserLoginToken> userTokenRepository, IEmailService emailService) : IAuthService
{
    public async Task<Result<bool>> LoginAsync(LoginRequest request, AgentDto agentDto)
    {
        var email = request.Email.Trim().ToLower();
        
        // vi tjekker i databasen om brugeren eksisterer
        var user = await userRepository.Query().SingleOrDefaultAsync(u => u.Email == email);
        
        // hvis brugeren er null, så smider vi en fejl
        if (user is null)
            return Result<bool>.NotFound(nameof(user), "Brugeren eksisterer ikke.");

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
        await userTokenRepository.Add(userToken);
        
        // til slut sender vi en email til brugeren med linket
        await emailService.SendMagicLinkAsync(user.Email, raw);
        
        return Result<bool>.Ok(true);
    }
    
    public async Task<Result<LoginVerifyResponse>> VerifyAsync(LoginVerifyRequest request, AgentDto agentDto)
    {
        var hash = Base64UrlTokenHelper.ComputeHash(request.Token);
        var token = await userTokenRepository.Query().SingleOrDefaultAsync(t => t.TokenHash == hash);
            
        if (token == null || token.UsedAt != null || token.ExpiresAt <= DateTime.UtcNow)
            return Result<LoginVerifyResponse>.ValidationError(nameof(token), "Ugyldig eller udløbet token.");
        
        var user = await userRepository.Query().SingleOrDefaultAsync(u => u.Id == token.UserId);
        
        if (user == null)
            return Result<LoginVerifyResponse>.NotFound(nameof(user), "Brugeren eksisterer ikke.");
        
        token.UsedAt = DateTime.UtcNow;
        token.ConsumedIp = agentDto.IpAddress;
        token.ConsumedUserAgent = agentDto.UserAgent;
        
        await userTokenRepository.Update(token);

        var jwt = jwtGenerator.GenerateTokenPair(user);
        var response = new LoginVerifyResponse
        {
            Jwt = jwt,
            User = UserDto.FromDatabase(user)
        };
        
        return Result<LoginVerifyResponse>.Ok(response);
    }
    
    public async Task<Result<LoginVerifyResponse>> RefreshAsync(string refreshToken, AgentDto agentDto)
    {
        var token = JwtValidator.ValidateRefreshToken(refreshToken);
        if (token == null)
            return Result<LoginVerifyResponse>.ValidationError(nameof(token), "Ugyldig refresh token.");

        var user = await userRepository.Query().SingleOrDefaultAsync(u => u.Id == token.Value);
        if (user == null)
            return Result<LoginVerifyResponse>.NotFound(nameof(user), "Brugeren eksisterer ikke.");

        var jwt = jwtGenerator.GenerateTokenPair(user);
        var response = new LoginVerifyResponse
        {
            Jwt = jwt,
            User = UserDto.FromDatabase(user)
        };
        
        return Result<LoginVerifyResponse>.Ok(response);
    }
}