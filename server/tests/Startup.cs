using DataAccess;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Service;

namespace tests;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // tilføj db som en singleton
        services.AddSingleton<TestDatabase>();

        // tilføj db context
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var db = sp.GetRequiredService<TestDatabase>();
            options.UseNpgsql(db.ConnectionString);
        });

        // register alle services
        services.ServiceStartup();
    }
}
