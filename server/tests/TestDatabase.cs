using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
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
        
        // opret en ny testcontainer
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("testdb")
            .WithUsername("postgres")
            .WithPassword("postgres")
            .Build();
        
        // start containeren
        _container.StartAsync().GetAwaiter().GetResult();
        
        // opret db skema som er VORES fra scaffolded db context
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        using var db = new AppDbContext(options);
        db.Database.EnsureCreated();

    }
    
    public ValueTask InitializeAsync() => ValueTask.CompletedTask;

    public async ValueTask DisposeAsync()
    {
        await _container.DisposeAsync();
    }
}
