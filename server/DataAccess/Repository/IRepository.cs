namespace DataAccess.Repository;

public interface IRepository<T>
{
    IQueryable<T> Query();
    Task Add(T entity);
    Task Update(T entity);
    Task Delete(T entity);
    Task<T?> FindAsync(object id);
}