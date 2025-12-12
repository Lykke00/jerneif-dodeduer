using System.Linq.Expressions;
using DataAccess.DTO;
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

    public async Task<PagedResult<TResult>> GetPagedAsync<TResult>(
        IQueryable<T> query,
        int page,
        int pageSize,
        Expression<Func<T, object>>? orderByDesc,
        Expression<Func<T, TResult>> selector)
    {
        // total count FØR paging
        var total = await query.CountAsync();

        if (orderByDesc != null)
        {
            query = query.OrderByDescending(orderByDesc);
        }

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(selector)
            .ToListAsync();

        return new PagedResult<TResult>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

}