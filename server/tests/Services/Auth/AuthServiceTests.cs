using Moq;
using Service.DTO.Auth;
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
}
