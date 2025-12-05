using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository;

public abstract class BaseRepository<T>(AppDbContext context) : IRepository<T>
    where T : class
{
    protected DbContext Context => context;
    protected abstract DbSet<T> Set { get; }

    public async Task Add(T entity)
    {
        await Set.AddAsync(entity);
        await context.SaveChangesAsync();
    }

    public async Task Delete(T entity)
    {
        Set.Remove(entity);
        await context.SaveChangesAsync();
    }

    public Task<T?> FindAsync(object id)
    {
        return Set.FindAsync(id).AsTask();
    }

    public IQueryable<T> Query()
    {
        return Set;
    }

    public async Task Update(T entity)
    {
        Set.Update(entity);
        await context.SaveChangesAsync();
    }
}