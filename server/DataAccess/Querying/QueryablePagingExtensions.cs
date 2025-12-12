using System.Linq.Expressions;
using DataAccess.DTO;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Querying;

public static class QueryablePagingExtensions
{
    public static async Task<PagedResult<TResult>> ToPagedAsync<TSource, TResult>(
        this IQueryable<TSource> query,
        int page,
        int pageSize,
        Expression<Func<TSource, object>>? orderByDesc,
        Expression<Func<TSource, TResult>> selector)
    {
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
