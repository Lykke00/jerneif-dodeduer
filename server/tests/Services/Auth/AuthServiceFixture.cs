using DataAccess;
using DataAccess.Models;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Moq;
using Service.Services.Auth;
using Service.Services.Email;

namespace tests.Services.Auth;
using DbUser = DataAccess.Models.User;

public sealed class AuthServiceFixture : IDisposable
{
    public AppDbContext DbContext { get; }

    public IRepository<User> UserRepository { get; }
    public IRepository<UserLoginToken> TokenRepository { get; }

    public Mock<IJwtGenerator> JwtGenerator { get; } = new();
    public Mock<IEmailService> EmailService { get; } = new();

    public AuthServiceFixture()
    {
        // lav en in-memory database til testning
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        // opret en ny database kontekst
        DbContext = new AppDbContext(options);

        // opret repositories som service klassen skal bruge
        UserRepository = new UserRepository(DbContext);
        TokenRepository = new UserLoginTokenRepository(DbContext); 
    }

    // metode til at oprette AuthService med de mockede dependencies
    public AuthService CreateService() =>
        new(
            JwtGenerator.Object,
            UserRepository,
            TokenRepository,
            EmailService.Object
        );

    public void Dispose()
    {
        DbContext.Database.EnsureDeleted();
        DbContext.Dispose();
    }
}
