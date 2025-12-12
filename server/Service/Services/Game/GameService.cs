using DataAccess;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.Game;

namespace Service.Services.Game;

public interface IGameService
{
    Task<Result<GameDto>> GetGameByIdAsync(Guid gameId);
    Task<Result<GameDto>> GetCurrentGame();
}

public class GameService(AppDbContext context) : IGameService
{
    public async Task<Result<GameDto>> GetGameByIdAsync(Guid gameId)
    {
        var game = await context.Games.FindAsync(gameId);
        if (game == null)
            throw new Exception("Game not found");

        return Result<GameDto>.Ok(GameDto.FromDatabase(game));
    }
    
    public async Task<Result<GameDto>> GetCurrentGame()
    {
        var game = await context.Games
            .FirstOrDefaultAsync(g => g.Active);

        if (game == null)
            return Result<GameDto>.NotFound("No active game found.");

        return Result<GameDto>.Ok(GameDto.FromDatabase(game));
    }
}