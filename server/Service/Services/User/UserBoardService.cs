using DataAccess;
using DataAccess.DTO;
using DataAccess.Models;
using DataAccess.Querying;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.User;
using Service.Helpers;

namespace Service.Services.User;

public interface IUserBoardService
{
    Task<PagedResult<UserGameBoardDto>> GetUserBoardsAsync(Guid userId, UserGameBoardAllRequest request);
    Task<Result<UserGameBoardDto>> CreateUserBoardAsync(Guid userId, CreateUserGameBoardRequest request);
    Task<Result<bool>> DeactivateUserBoard(Guid userId, Guid boardId);
    Task<Result<List<UserGameBoardHistoryDto>>> GetHistoryAsync(Guid userId, Guid boardId);
}

public class UserBoardService(AppDbContext context) : IUserBoardService
{
public async Task<PagedResult<UserGameBoardDto>> GetUserBoardsAsync(
    Guid userId,
    UserGameBoardAllRequest request)
{
    var query = context.GameBoards
        .Where(b => b.UserId == userId);

    if (request.Active.HasValue)
    {
        if (request.Active.Value)
        {
            query = query.Where(b => b.BoardRepeatPlans.Any(rp => rp.Active));
        }
        else
        {
            query = query.Where(b => !b.BoardRepeatPlans.Any(rp => rp.Active));
        }
    }

    var projectedQuery = query.Select(b => new
    {
        Board = b,
        LatestPlan = b.BoardRepeatPlans
            .OrderByDescending(rp => rp.Active)
            .ThenByDescending(rp => rp.StoppedAt ?? DateTime.MaxValue)
            .FirstOrDefault(),
        ActivePlan = b.BoardRepeatPlans.FirstOrDefault(rp => rp.Active),
        NumberCount = b.GameBoardNumbers.Count,
        Numbers = b.GameBoardNumbers
            .OrderBy(n => n.Number)
            .Select(n => n.Number)
            .ToList()
    });

    var pagedData = await projectedQuery.ToPagedAsync(
        page: request.Page,
        pageSize: request.PageSize,
        orderByDesc: x => x.Board.CreatedAt,
        selector: x => x);

    var dtos = pagedData.Items.Select(x =>
    {
        var pricePerGame = GamePricing.CalculateBoardPriceInt(x.NumberCount);
        var plan = x.ActivePlan ?? x.LatestPlan;

        var repeatCount = plan?.RepeatCount ?? 0;

        return new UserGameBoardDto
        {
            Id = x.Board.Id,
            CreatedAt = x.Board.CreatedAt,
            Numbers = x.Numbers,
            RepeatCount = repeatCount,
            PlayedCount = plan?.PlayedCount ?? 0,
            Active = plan != null,
            StoppedAt = plan?.StoppedAt,
            PricePerGame = pricePerGame,
            TotalPrice = pricePerGame * repeatCount
        };
    }).ToList();

    return new PagedResult<UserGameBoardDto>
    {
        Items = dtos,
        TotalCount = pagedData.TotalCount,
        Page = pagedData.Page,
        PageSize = pagedData.PageSize
    };
}    
public async Task<Result<UserGameBoardDto>> CreateUserBoardAsync(
        Guid userId,
        CreateUserGameBoardRequest request)
    {
        if (request.Numbers.Count == 0)
        {
            return Result<UserGameBoardDto>.ValidationError("At least one number must be provided.");
        }

        var gameBoard = new GameBoard
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            GameBoardNumbers = request.Numbers
                .Select(n => new GameBoardNumber { Number = n })
                .ToList(),
            BoardRepeatPlans = new List<BoardRepeatPlan>
            {
                new BoardRepeatPlan
                {
                    RepeatCount = request.RepeatCount,
                    PlayedCount = 0,
                    Active = true
                }
            }
        };

        context.GameBoards.Add(gameBoard);
        await context.SaveChangesAsync();

        var dto = new UserGameBoardDto
        {
            Id = gameBoard.Id,
            CreatedAt = gameBoard.CreatedAt,
            Numbers = gameBoard.GameBoardNumbers
                .OrderBy(n => n.Number)
                .Select(n => n.Number)
                .ToList(),
            RepeatCount = request.RepeatCount,
            PlayedCount = 0,
            PricePerGame = GamePricing.CalculateBoardPriceInt(request.Numbers.Count),
            TotalPrice = (GamePricing.CalculateBoardPriceInt(request.Numbers.Count) * request.RepeatCount),
            Active = true
        };

        return Result<UserGameBoardDto>.Ok(dto);
    }
    
    public async Task<Result<bool>> DeactivateUserBoard(Guid userId, Guid boardId)
    {
        var gameBoard = await context.GameBoards
            .Where(b => b.Id == boardId && b.UserId == userId)
            .FirstOrDefaultAsync();

        if (gameBoard == null)
            return Result<bool>.NotFound("Game board not found.");

        var activePlans = await context.BoardRepeatPlans
            .Where(rp => rp.BoardId == boardId && rp.Active)
            .ToListAsync();

        foreach (var plan in activePlans)
        {
            plan.Active = false;
            plan.StoppedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();

        return Result<bool>.Ok(true);
    }
    
    public async Task<Result<List<UserGameBoardHistoryDto>>> GetHistoryAsync(Guid userId, Guid boardId)
    {
        var gameBoard = await context.GameBoards
            .Include(b => b.GameBoardNumbers)
            .Include(b => b.BoardPlayedGames)
                .ThenInclude(bpg => bpg.Game)
                    .ThenInclude(g => g.GameWinningNumbers)
            .Where(b => b.Id == boardId && b.UserId == userId)
            .FirstOrDefaultAsync();

        if (gameBoard == null)
            return Result<List<UserGameBoardHistoryDto>>.NotFound("Game board not found.");

        var boardNumbers = gameBoard.GameBoardNumbers
            .OrderBy(n => n.Number)
            .Select(n => n.Number)
            .ToList();

        var price = GamePricing.CalculateBoardPriceInt(boardNumbers.Count);

        var historyDtos = gameBoard.BoardPlayedGames
            .OrderByDescending(bpg => bpg.PlayedAt)
            .Select(bpg => new UserGameBoardHistoryDto
            {
                GameWeek = bpg.Game.Week.ToString(),
                Year = bpg.Game.Year.ToString(),
                Price = price,
                Numbers = boardNumbers,
                WinningNumbers = bpg.Game.GameWinningNumbers
                    .OrderBy(n => n.Number)
                    .Select(n => n.Number)
                    .ToList(),
                Message = bpg.Message ?? "No message available",
                IsSuccess = bpg.Success
            })
            .ToList();

        return Result<List<UserGameBoardHistoryDto>>.Ok(historyDtos);
    }
    
}