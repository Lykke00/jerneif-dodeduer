using DataAccess;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Service.DTO.Auth;
using Service.Models;
using Service.Options;
using Service.Services.Auth;
using tests.Helpers;

namespace tests.Services.Auth;

using DataAccess.Models;
using Service.DTO.Auth.Login;

public class AuthServiceTests
{
    private readonly AppDbContext _db;
    private readonly IAuthService _service;
    private readonly IJwtGenerator _jwtGenerator;

    public AuthServiceTests(AppDbContext db, IAuthService service, IJwtGenerator jwtGenerator)
    {
        _db = db;
        _service = service;
        _jwtGenerator = jwtGenerator;
    }


    [Fact]
    public async Task LoginAsync_UserExists_CreatesTokenAndSendsEmail()
    {
        // Arrange
        var email = "test@test.com";
        await TestDataFactory.CreateUserAsync(_db, email);
        
        var request = new LoginRequest
        {
            Email = email
        };

        var agent = new AgentDto
        {
            IpAddress = "127.0.0.1",
            UserAgent = "xunit"
        };
        
        // Act
        var result = await _service.LoginAsync(request, agent);
        
        // Assert
        Assert.True(result.Success);

        var tokenCount = await _db.Set<UserLoginToken>().CountAsync(cancellationToken: TestContext.Current.CancellationToken);
        Assert.Equal(1, tokenCount);
    }

    [Fact]
    public async Task LoginAsync_UserDoesNotExist_ReturnsError()
    {
        var doesntExist = "doesnt@exist.com";
        var request = new LoginRequest
        {
            Email = doesntExist
        };

        var agent = new AgentDto
        {
            IpAddress = "127.0.0.1",
            UserAgent = "xunit"
        };
        
        var result = await _service.LoginAsync(request, agent);
        
        Assert.False(result.Success);
    }

    [Fact]
    public async Task VerifyAsync_ValidToken_ReturnsJwtAndMarksTokenAsUsed()
    {
        var user = await TestDataFactory.CreateUserAsync(
            _db, "verify@test.com");

        var rawToken = WebEncoders.Base64UrlEncode(Guid.NewGuid().ToByteArray());
        var hash = Base64UrlTokenHelper.ComputeHash(rawToken);

        await _db.Set<UserLoginToken>().AddAsync(new UserLoginToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            RequestedIp = "127.0.0.1",
            RequestedUserAgent = "xunit"
        }, TestContext.Current.CancellationToken);

        await _db.SaveChangesAsync(TestContext.Current.CancellationToken);

        var result = await _service.VerifyAsync(
            new LoginVerifyRequest { Token = rawToken },
            new AgentDto { IpAddress = "10.0.0.1", UserAgent = "verify-test" });

        Assert.True(result.Success);
        Assert.NotNull(result.Value);

        var updatedToken = await _db.Set<UserLoginToken>()
            .SingleAsync(t => t.TokenHash == hash, cancellationToken: TestContext.Current.CancellationToken);

        Assert.NotNull(updatedToken.UsedAt);
        Assert.Equal("10.0.0.1", updatedToken.ConsumedIp);
    }

    [Fact]
    public async Task VerifyAsync_TokenIsNotBase64_ThrowsFormatException()
    {
        // arrange
        var request = new LoginVerifyRequest
        {
            Token = "not-base64"
        };

        // act+assert
        await Assert.ThrowsAsync<FormatException>(() =>
            _service.VerifyAsync(request, new AgentDto()));
    }
    
    [Fact]
    public async Task VerifyAsync_TokenNotFound_ReturnsValidationError()
    {
        var rawToken = WebEncoders.Base64UrlEncode(Guid.NewGuid().ToByteArray());

        var request = new LoginVerifyRequest
        {
            Token = rawToken
        };

        var result = await _service.VerifyAsync(request, new AgentDto());

        Assert.False(result.Success);
        Assert.Equal(400, result.StatusCode);
    }
    
    [Fact]
    public async Task VerifyAsync_ExpiredToken_ReturnsValidationError()
    {
        // arrange
        var user = await TestDataFactory.CreateUserAsync(
            _db, "expired@test.com");

        var rawToken = WebEncoders.Base64UrlEncode(Guid.NewGuid().ToByteArray());
        var hash = Base64UrlTokenHelper.ComputeHash(rawToken);

        await _db.Set<UserLoginToken>().AddAsync(new UserLoginToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(-5)
        }, TestContext.Current.CancellationToken);

        await _db.SaveChangesAsync(TestContext.Current.CancellationToken);

        // act
        var result = await _service.VerifyAsync(
            new LoginVerifyRequest { Token = rawToken },
            new AgentDto());

        // assert
        Assert.False(result.Success);
        Assert.Equal(400, result.StatusCode);

        Assert.True(result.Errors.ContainsKey("token"));
    }
    
    [Fact]
    public async Task RefreshAsync_ValidRefreshToken_ReturnsJwtPair()
    {
        // arrange
        var user = await TestDataFactory.CreateUserAsync(
            _db, "refresh@test.com");

        // Use the SAME JwtGenerator configuration as the service
        // (comes from DI via ServiceStartup)
        var jwtGenerator = new JwtGenerator(
            Options.Create(new AppOptions
            {
                Jwt = new JwtOptions
                {
                    Secret = "THIS_IS_A_TEST_SECRET_KEY_123456789",
                    Issuer = "test-issuer",
                    Audience = "test-audience",
                    AccessTokenMinutes = 5,
                    RefreshTokenDays = 7
                }
            }));

        // Create a valid refresh token
        var initialPair = jwtGenerator.GenerateTokenPair(user);

        // act
        var result = await _service.RefreshAsync(
            initialPair.RefreshToken,
            new AgentDto());

        // assert
        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);

        Assert.NotNull(result.Value);
        Assert.NotNull(result.Value!.Jwt);

        Assert.False(string.IsNullOrWhiteSpace(result.Value.Jwt.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(result.Value.Jwt.RefreshToken));

        Assert.Equal(user.Email, result.Value.User.Email);
    }
    
    [Fact]
    public async Task RefreshAsync_TokenIsNotJwt_ThrowsSecurityTokenMalformedException()
    {
        // arrange
        var invalidToken = "not-a-jwt";

        // act + assert
        await Assert.ThrowsAsync<SecurityTokenMalformedException>(() =>
            _service.RefreshAsync(invalidToken, new AgentDto()));
    }
    
    [Fact]
    public async Task RefreshAsync_UserDoesNotExist_ReturnsNotFound()
    {
        // arrange
        var nonExistingUserId = Guid.NewGuid();

        var appOptions = Options.Create(new AppOptions
        {
            Jwt = new JwtOptions
            {
                Secret = "THIS_IS_A_TEST_SECRET_KEY_123456789",
                Issuer = "test-issuer",
                Audience = "test-audience",
                AccessTokenMinutes = 5,
                RefreshTokenDays = 7
            }
        });

        var realJwtGenerator = new JwtGenerator(appOptions);

        var fakeUser = new User
        {
            Id = nonExistingUserId,
            Email = "ghost@test.com"
        };

        var pair = realJwtGenerator.GenerateTokenPair(fakeUser);

        // act
        var result = await _service.RefreshAsync(
            pair.RefreshToken,
            new AgentDto());

        // assert
        Assert.False(result.Success);
        Assert.Equal(404, result.StatusCode);

        Assert.True(result.Errors.ContainsKey("user"));
        Assert.Contains(
            "Brugeren eksisterer ikke.",
            result.Errors["user"]);
    }
}
