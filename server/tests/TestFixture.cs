using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace tests;

public class TestFixture : IDisposable
{
    public AppDbContext DbContext { get; }

    public TestFixture()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        DbContext = new AppDbContext(options);
    }

    public void Dispose()
    {
        DbContext.Database.EnsureDeleted();
        DbContext.Dispose();
    }
    
}