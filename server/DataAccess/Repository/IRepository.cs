using System.Linq.Expressions;
using DataAccess.DTO;

namespace DataAccess.Repository;

public interface IRepository<T>
{
    IQueryable<T> Query();
    Task Add(T entity);
    Task Update(T entity);
    Task Delete(T entity);
    Task<T?> FindAsync(object id);
    Task<PagedResult<TResult>> GetPagedAsync<TResult>(
        IQueryable<T> query,
        int page,
        int pageSize,
        Expression<Func<T, object>>? orderByDesc,
        Expression<Func<T, TResult>> selector);
}