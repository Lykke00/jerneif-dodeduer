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
    // start med at få fat i alle gameboards hvor userId = request.userId
    var query = context.GameBoards
        .Where(b => b.UserId == userId);

    // hvis aktiv feltet har en værdi
    if (request.Active.HasValue)
    {
        // hvis den er sandt, så søger vi kun efter aktive bræt
        if (request.Active.Value)
        {
            query = query.Where(b => b.BoardRepeatPlans.Any(rp => rp.Active));
        }
        //hvis den er falsk, så søger vi kun efter inaktive bræt
        else
        {
            query = query.Where(b => !b.BoardRepeatPlans.Any(rp => rp.Active));
        }
    }

    // i hver query, skal vi have fat i nogle vigtige dataer
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

    // få fat i paginated data, altså med sider osv.
    var pagedData = await projectedQuery.ToPagedAsync(
        page: request.Page,
        pageSize: request.PageSize,
        orderByDesc: x => x.Board.CreatedAt,
        selector: x => x);

    // omskriv til dtos og lav til en liste
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

    // returner til bruger
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
        // der skal være numre 
        if (request.Numbers.Count == 0)
            return Result<UserGameBoardDto>.ValidationError("At least one number must be provided.");

        // opret et nyt gameboard
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

        // gem i databasen
        context.GameBoards.Add(gameBoard);
        await context.SaveChangesAsync();

        // opret en ny dto vi kan sende tilbage til brugeren
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
            PricePerGame = GamePricing.CalculateBoardPriceInt(request.Numbers.Count), //udregn pris
            TotalPrice = (GamePricing.CalculateBoardPriceInt(request.Numbers.Count) * request.RepeatCount), //udregn pris
            Active = true
        };

        // gem i databasen
        return Result<UserGameBoardDto>.Ok(dto);
    }
    
    public async Task<Result<bool>> DeactivateUserBoard(Guid userId, Guid boardId)
    {
        // få fat i brættet
        var gameBoard = await context.GameBoards
            .Where(b => b.Id == boardId && b.UserId == userId)
            .FirstOrDefaultAsync();

        // hvis brættet er null, så må vi gå udfra det ikke eksisterer
        if (gameBoard == null)
            return Result<bool>.NotFound("Game board not found.");

        // få fat i dem alle hvor de er aktive
        var activePlans = await context.BoardRepeatPlans
            .Where(rp => rp.BoardId == boardId && rp.Active)
            .ToListAsync();

        // hvor hver plan, i activePlans hvor active = true
        foreach (var plan in activePlans)
        {
            // sæt til false og hvornår det blev stoppet
            plan.Active = false;
            plan.StoppedAt = DateTime.UtcNow;
        }

        // gem i databasen
        await context.SaveChangesAsync();

        // returner sandt til brugeren
        return Result<bool>.Ok(true);
    }
    
    public async Task<Result<List<UserGameBoardHistoryDto>>> GetHistoryAsync(Guid userId, Guid boardId)
    {
        // få fat i hver bræt, hvor vi joiner nogle felter på
        var gameBoard = await context.GameBoards
            .Include(b => b.GameBoardNumbers)
            .Include(b => b.BoardPlayedGames)
                .ThenInclude(bpg => bpg.Game)
                    .ThenInclude(g => g.GameWinningNumbers)
            .Where(b => b.Id == boardId && b.UserId == userId) // hvor boardId  =request.Id og userId = request.UserId
            .FirstOrDefaultAsync();

        // hvis brættet er null, så må den ikke eksisterer
        if (gameBoard == null)
            return Result<List<UserGameBoardHistoryDto>>.NotFound("Game board not found.");

        // få fat i alle numre for selve brættet
        var boardNumbers = gameBoard.GameBoardNumbers
            .OrderBy(n => n.Number)
            .Select(n => n.Number)
            .ToList();

        // udregn prisen
        var price = GamePricing.CalculateBoardPriceInt(boardNumbers.Count);

        // få fat i historikken, altså alle spillet bræt for at vies dem
        // vinder tal bliver sendt med, så vi kan sortere det i frontend og vise noget pænt.
        var historyDtos = gameBoard.BoardPlayedGames
            .OrderByDescending(bpg => bpg.PlayedAt)
            .Select(bpg => new UserGameBoardHistoryDto
            {
                GameWeek = bpg.Game.Week.ToString(),
                Year = bpg.Game.Year.ToString(),
                Price = price,
                Numbers = boardNumbers,
                WinningNumbers = bpg.Game.GameWinningNumbers // få fat i vindertal for denne
                    .OrderBy(n => n.Number)
                    .Select(n => n.Number)
                    .ToList(),
                Message = bpg.Message ?? "No message available", // information besked
                IsSuccess = bpg.Success
            })
            .ToList();

        // retuner til bruger
        return Result<List<UserGameBoardHistoryDto>>.Ok(historyDtos);
    }
    
}