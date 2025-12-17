using DataAccess;
using DataAccess.DTO;
using DataAccess.Models;
using DataAccess.Querying;
using Service.DTO;
using Service.DTO.User;
using Service.Helpers;

namespace Service.Services.User;

public interface IUserBoardService
{
    Task<PagedResult<UserGameBoardDto>> GetUserBoardsAsync(Guid userId, PaginationRequest request);
    Task<Result<UserGameBoardDto>> CreateUserBoardAsync(Guid userId, CreateUserGameBoardRequest request);
}

public class UserBoardService(AppDbContext context) : IUserBoardService
{
    public async Task<PagedResult<UserGameBoardDto>> GetUserBoardsAsync(
        Guid userId,
        PaginationRequest request)
    {
        var query = context.GameBoards
            .Where(b => b.UserId == userId)
            .Select(b => new
            {
                Board = b,
                ActivePlan = b.BoardRepeatPlans.FirstOrDefault(rp => rp.Active),
                NumberCount = b.GameBoardNumbers.Count,
                Numbers = b.GameBoardNumbers
                    .OrderBy(n => n.Number)
                    .Select(n => n.Number)
                    .ToList()
            });

        var pagedData = await query.ToPagedAsync(
            page: request.Page,
            pageSize: request.PageSize,
            orderByDesc: x => x.Board.CreatedAt,
            selector: x => x);

        var dtos = pagedData.Items.Select(x =>
        {
            var pricePerGame = GamePricing.CalculateBoardPriceInt(x.NumberCount);
            var repeatCount = x.ActivePlan?.RepeatCount ?? 0;
        
            return new UserGameBoardDto
            {
                Id = x.Board.Id,
                CreatedAt = x.Board.CreatedAt,
                Numbers = x.Numbers,
                RepeatCount = repeatCount,
                PlayedCount = x.ActivePlan?.PlayedCount ?? 0,
                Active = x.ActivePlan != null,
                StoppedAt = x.ActivePlan?.StoppedAt,
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
}