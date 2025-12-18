using System.Net;
using System.Net.Http.Json;
using Api.Rest;
using DataAccess;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using tests.Helpers;

namespace tests.Api;

public class AuthControllerTests 
    : IClassFixture<ApiTestFactory>
{
    private readonly HttpClient _client;
    private readonly ApiTestFactory _factory;

    public AuthControllerTests(ApiTestFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_InvalidEmail_ReturnsBadRequest()
    {
        // arrange
        var email = "invalid.com";
        
        // act
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { Email = email }, cancellationToken: TestContext.Current.CancellationToken);

        // assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
    
    [Fact]
    public async Task Login_ValidEmail_ReturnsOk()
    {
        // arrange
        var email = "test@test.com";

        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // opret en bruger i databasen som vi kan tage udgangspunkt i
        await TestDataFactory.CreateUserAsync(db, email);

        // act
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { Email = email }, cancellationToken: TestContext.Current.CancellationToken);

        // assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}