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
        
        // hvis brugeren er inaktiv, så ikke tillad at sende token
        if (!user.Active)
            return Result<bool>.Forbidden(nameof(user), "Brugeren er ikke aktiv");

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
        await userTokenRepository.Add(userToken);
        
        // til slut sender vi en email til brugeren med linket
        await emailService.SendMagicLinkAsync(user.Email, raw);
        
        return Result<bool>.Ok(true);
    }
    
    public async Task<Result<LoginVerifyResponse>> VerifyAsync(LoginVerifyRequest request, AgentDto agentDto)
    {
        // start med at compute hash fra den token som er i mailen
        var hash = Base64UrlTokenHelper.ComputeHash(request.Token);
        
        // tjek derefter om den hash eksisterer i databasen
        var token = await userTokenRepository.Query().SingleOrDefaultAsync(t => t.TokenHash == hash);
            
        // hvis den ikke eksisterer, er brugt eller udløbet så meld fejl tilbage
        if (token == null || token.UsedAt != null || token.ExpiresAt <= DateTime.UtcNow)
            return Result<LoginVerifyResponse>.ValidationError(nameof(token), "Ugyldig eller udløbet token.");
        
        // få fat i brugeren
        var user = await userRepository.Query().SingleOrDefaultAsync(u => u.Id == token.UserId);
        
        // hvis brugeren ikke eksisterer, så returner en fejl
        if (user == null)
            return Result<LoginVerifyResponse>.NotFound(nameof(user), "Brugeren eksisterer ikke.");
        
        // opdater selve token, for at vise den er brugt
        token.UsedAt = DateTime.UtcNow;
        token.ConsumedIp = agentDto.IpAddress;
        token.ConsumedUserAgent = agentDto.UserAgent;
        
        // gem token
        await userTokenRepository.Update(token);

        // opret ny access og refresh token til brugeren
        var jwt = jwtGenerator.GenerateTokenPair(user);
        var response = new LoginVerifyResponse
        {
            Jwt = jwt,
            User = UserDto.FromDatabase(user)
        };
        
        // returner jwt
        return Result<LoginVerifyResponse>.Ok(response);
    }
    
    public async Task<Result<LoginVerifyResponse>> RefreshAsync(string refreshToken, AgentDto agentDto)
    {
        // valider refersh token
        var token = JwtValidator.ValidateRefreshToken(refreshToken);
        
        // hvis token er null, så er den ugyldig
        if (token == null)
            return Result<LoginVerifyResponse>.ValidationError(nameof(token), "Ugyldig refresh token.");

        // få fat i brugeren fra token af
        var user = await userRepository.Query().SingleOrDefaultAsync(u => u.Id == token.Value);
        if (user == null)
            return Result<LoginVerifyResponse>.NotFound(nameof(user), "Brugeren eksisterer ikke.");

        // hvis brugeren er inaktiv, så ikke tillad et login
        if (user.Active == false)
            return Result<LoginVerifyResponse>.Forbidden(nameof(user), "Brugeren er ikke aktiv");

        // lav ny access og refresh token til brugeren
        var jwt = jwtGenerator.GenerateTokenPair(user);
        var response = new LoginVerifyResponse
        {
            Jwt = jwt,
            User = UserDto.FromDatabase(user)
        };
        
        // send tilbage til brugeren
        return Result<LoginVerifyResponse>.Ok(response);
    }
}