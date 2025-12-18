using DataAccess;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Testcontainers.PostgreSql;

namespace tests;

public sealed class TestDatabase : IAsyncLifetime
{
    private readonly IServiceProvider _services;
    private PostgreSqlContainer _container = null!;

    public string ConnectionString => _container.GetConnectionString();

    public TestDatabase(IServiceProvider services)
    {
        _services = services;
    }

    
    public async ValueTask InitializeAsync()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("testdb")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();

        await _container.StartAsync();

        // 👇 THIS is what actually makes EF use your DB
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await db.Database.EnsureCreatedAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _container.DisposeAsync();
    }
}
