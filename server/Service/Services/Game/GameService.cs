using System.Data;
using DataAccess;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.Game;
using Service.Helpers;
using Service.Services.User;

namespace Service.Services.Game;

public interface IGameService
{
    Task<Result<GameDto>> GetGameByIdAsync(Guid gameId);
    Task<Result<GameDto>> GetCurrentGame();
    Task<Result<GameUserPlayResponse>> PlayGameAsync(Guid userId, Guid gameId, GameUserPlayRequest request);
}

public class GameService(AppDbContext context, IUserService userService, IUserBalanceService balanceService) : IGameService
{
    public async Task<Result<GameDto>> GetGameByIdAsync(Guid gameId)
    {
        // find et spil ud fra game id
        var game = await context.Games.FindAsync(gameId);
        if (game == null)
            return Result<GameDto>.NotFound("game", "Game not found.");

        // returner spillet
        return Result<GameDto>.Ok(GameDto.FromDatabase(game));
    }
    
    public async Task<Result<GameDto>> GetCurrentGame()
    {
        // find det aktive spil
        var game = await context.Games
            .FirstOrDefaultAsync(g => g.Active);

        if (game == null)
            return Result<GameDto>.NotFound("No active game found.");

        return Result<GameDto>.Ok(GameDto.FromDatabase(game));
    }
    
    private static GamePlay CreateGamePlay(
        Guid userId,
        Guid gameId,
        IEnumerable<int> numbers)
    {
        var playId = Guid.NewGuid();

        // opret et nyt spil
        var gamePlay = new GamePlay
        {
            Id = playId,
            UserId = userId,
            GameId = gameId,
            CreatedAt = DateTime.UtcNow
        };

        // tilføj de valgte numre til spillet i en anden tabel
        foreach (var number in numbers)
        {
            gamePlay.GamePlaysNumbers.Add(new GamePlaysNumber
            {
                PlayId = playId,
                Number = number
            });
        }

        return gamePlay;
    }

    public async Task<Result<GameUserPlayResponse>> PlayGameAsync(Guid userId, Guid gameId, GameUserPlayRequest request)
    {
        // MEGET vigtig, da vi skal sørge for ingen andre transaktioner kan ændre i balancen
        await using var tx = await context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable);

        try
        {
            // tjek om brugeren findes
            var userResult = await userService.GetByIdAsync(userId);
            if (!userResult.Success || userResult.Value == null)
                return Result<GameUserPlayResponse>.FromResult(userResult);

            // tjek om spillet findes
            var gameResult = await GetGameByIdAsync(gameId);
            if (!gameResult.Success)
                return Result<GameUserPlayResponse>.FromResult(gameResult);

            // beregn pris for brættet
            var fieldCount = request.Numbers.Count;
            var boardPrice = GamePricing.CalculateBoardPrice(fieldCount);

            var balance = await context.UsersBalances
                .Where(x => x.UserId == userId)
                .SumAsync(x => x.Amount);

            var totalPrice = boardPrice * request.Amount;
            if (balance < totalPrice)
                return Result<GameUserPlayResponse>.Conflict("balance", "Insufficient balance to play this board.");

            // opret spillet og træk beløbet fra brugerens balance
            for (var i = 0; i < request.Amount; i++)
            {
                var gamePlay = CreateGamePlay(userId, gameId, request.Numbers);

                await balanceService.AddPlayAsync(userId, gamePlay.Id, boardPrice);
                context.GamePlays.Add(gamePlay);
            }
            
            // gem ændringerne og commit transaktionen
            await context.SaveChangesAsync();
            await tx.CommitAsync();

            var newBalance = await context.UsersBalances
                .Where(x => x.UserId == userId)
                .SumAsync(x => x.Amount);

            
            return Result<GameUserPlayResponse>.Ok(new GameUserPlayResponse
            {
                TotalPrice = totalPrice,
                NewBalance = newBalance
            });
        }
        catch
        {
            await tx.RollbackAsync();
            return Result<GameUserPlayResponse>.InternalError("An error occurred while processing the game play.");
        }
    }
}