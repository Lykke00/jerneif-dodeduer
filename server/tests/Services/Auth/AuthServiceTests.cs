using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Service.DTO.Auth;
using Service.Models;
using Service.Options;
using Service.Services.Auth;
using tests.Helpers;

namespace tests.Services.Auth;

using DataAccess.Models;
using Service.DTO.Auth.Login;

public class AuthServiceTests : IClassFixture<AuthServiceFixture>
{
    private readonly AuthServiceFixture _fx;
    private readonly IAuthService _service;

    public AuthServiceTests(AuthServiceFixture fx)
    {
        _fx = fx;
        _service = _fx.CreateService();
    }

    [Fact]
    public async Task LoginAsync_UserExists_CreatesTokenAndSendsEmail()
    {
        var email = "test@test.com";

        await TestDataFactory.CreateUserAsync(_fx.DbContext, email);
        
        // Arrange
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

        _fx.EmailService.Verify(
            e => e.SendMagicLinkAsync(
                email,
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        Assert.Single(_fx.DbContext.Set<UserLoginToken>());
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
        // arrange
        var email = "preben@gmail.com";
        var user = await TestDataFactory.CreateUserAsync(_fx.DbContext, email);

        var rawBytes = Guid.NewGuid().ToByteArray();
        var rawToken = WebEncoders.Base64UrlEncode(rawBytes);
        var hash = Base64UrlTokenHelper.ComputeHash(rawToken);

        var loginToken = new UserLoginToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            RequestedIp = "127.0.0.1",
            RequestedUserAgent = "xunit"
        };

        await _fx.DbContext.Set<UserLoginToken>().AddAsync(loginToken, TestContext.Current.CancellationToken);
        await _fx.DbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

        var jwtPair = new JwtPair
        {
            AccessToken = "access",
            RefreshToken = "refresh"
        };

        _fx.JwtGenerator
            .Setup(j => j.GenerateTokenPair(user))
            .Returns(jwtPair);

        var request = new LoginVerifyRequest
        {
            Token = rawToken
        };

        var agent = new AgentDto
        {
            IpAddress = "10.0.0.1",
            UserAgent = "verify-test"
        };

        // act
        var result = await _service.VerifyAsync(request, agent);

        // assert
        Assert.True(result.Success);
        Assert.NotNull(result.Value);

        Assert.Equal(jwtPair, result.Value.Jwt);
        Assert.Equal(user.Email, result.Value.User.Email);

        var updatedToken = await _fx.DbContext.Set<UserLoginToken>().SingleAsync(cancellationToken: TestContext.Current.CancellationToken);
        Assert.NotNull(updatedToken.UsedAt);
        Assert.Equal(agent.IpAddress, updatedToken.ConsumedIp);
        Assert.Equal(agent.UserAgent, updatedToken.ConsumedUserAgent);

        _fx.JwtGenerator.Verify(
            j => j.GenerateTokenPair(user),
            Times.Once);
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
            _fx.DbContext, "expired@test.com");

        var rawToken = WebEncoders.Base64UrlEncode(Guid.NewGuid().ToByteArray());
        var hash = Base64UrlTokenHelper.ComputeHash(rawToken);

        await _fx.DbContext.Set<UserLoginToken>().AddAsync(new UserLoginToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(-5)
        }, TestContext.Current.CancellationToken);

        await _fx.DbContext.SaveChangesAsync(TestContext.Current.CancellationToken);

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
    public async Task RefreshAsync_ValidRefreshToken_ReturnsNewJwtPair()
    {
        // arrange
        var user = await TestDataFactory.CreateUserAsync(
            _fx.DbContext, "refresh@test.com");

        // rigtig JwtGenerator til at LAVE refresh token
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
        var initialPair = realJwtGenerator.GenerateTokenPair(user);

        // mocked JwtGenerator til AuthService output
        var newPair = new JwtPair
        {
            AccessToken = "new-access",
            RefreshToken = "new-refresh"
        };

        _fx.JwtGenerator
            .Setup(j => j.GenerateTokenPair(It.Is<User>(u => u.Id == user.Id)))
            .Returns(newPair);

        // act
        var result = await _service.RefreshAsync(
            initialPair.RefreshToken,
            new AgentDto());

        // assert
        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);

        Assert.NotNull(result.Value);
        Assert.Equal(newPair, result.Value.Jwt);
        Assert.Equal(user.Email, result.Value.User.Email);

        _fx.JwtGenerator.Verify(
            j => j.GenerateTokenPair(It.Is<User>(u => u.Id == user.Id)),
            Times.Once);
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
