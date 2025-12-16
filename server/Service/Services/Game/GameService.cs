using System.Data;
using DataAccess;
using DataAccess.DTO;
using DataAccess.Models;
using DataAccess.Querying;
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
    Task<Result<GameDto>> UpdateGameAsync(Guid gameId, GameUpdateRequest request);
    Task<Result<GameDto>> CreateGameAsync(GameCreateRequest request);
    Task<PagedResult<UserWinnerDto>> GetWinnersAsync(Guid gameId, PaginationRequest request);
    Task<PagedResult<GameExtendedDto>> GetAllGamesAsync(PaginationRequest request);
    Task<Result<GameExtendedDto>> GetGameDetailsAsync(Guid gameId);
}

public class GameService(AppDbContext context, IUserService userService, IUserBalanceService balanceService) : IGameService
{
    public async Task<Result<GameDto>> GetGameByIdAsync(Guid gameId)
    {
        // find et spil ud fra game id
        var game = await context.Games
            .Include(g => g.GameWinningNumbers)
            .FirstOrDefaultAsync(g => g.Id == gameId);
        
        if (game == null)
            return Result<GameDto>.NotFound("game", "Game not found.");

        // returner spillet
        return Result<GameDto>.Ok(GameDto.FromDatabase(game));
    }
    
    public async Task<Result<GameDto>> GetCurrentGame()
    {
        // find det aktive spil
        var game = await context.Games
            .FirstOrDefaultAsync(g => g.GameWinningNumbers.Count == 0);

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
    
    public async Task<Result<GameDto>> UpdateGameAsync(Guid gameId, GameUpdateRequest request)
    {
        // find spillet
        var game = await context.Games
            .Include(g => g.GameWinningNumbers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<GameDto>.NotFound("game", "Game not found.");

        // opdater spillets vindende numre
        game.GameWinningNumbers.Clear();
        foreach (var number in request.WinningNumbers)
        {
            game.GameWinningNumbers.Add(new GameWinningNumber
            {
                GameId = gameId,
                Number = number
            });
        }
        
        await context.SaveChangesAsync();
        var updatedGame = await context.Games
            .Include(g => g.GameWinningNumbers)
            .AsNoTracking()
            .FirstAsync(g => g.Id == gameId);

        return Result<GameDto>.Ok(GameDto.FromDatabase(updatedGame));    
    }
    
    public async Task<Result<GameDto>> CreateGameAsync(GameCreateRequest request)
    {
        // tjek om spillet allerede findes
        var activeGameExists = await context.Games
            .AnyAsync(g => !g.GameWinningNumbers.Any());


        if (activeGameExists)
            return Result<GameDto>.Conflict("game", "Game game already exists.");

        // opret et nyt spil
        var newGame = new DataAccess.Models.Game
        {
            Id = Guid.NewGuid(),
            Week = request.WeekNumber,
            Year = DateTime.UtcNow.Year,
            CreatedAt = DateTime.UtcNow
        };

        context.Games.Add(newGame);
        await context.SaveChangesAsync();

        return Result<GameDto>.Ok(GameDto.FromDatabase(newGame));
    }
    
public async Task<PagedResult<UserWinnerDto>> GetWinnersAsync(
    Guid gameId,
    PaginationRequest request)
{
    // 1. Hent vindertal
    var winningNumbers = await context.GameWinningNumbers
        .Where(x => x.GameId == gameId)
        .Select(x => x.Number)
        .ToListAsync();

    if (winningNumbers.Count == 0)
    {
        return new PagedResult<UserWinnerDto>
        {
            Items = [],
            TotalCount = 0,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    // 2. Hent alle GamePlays med deres numbers for dette spil
    var gamePlaysWithNumbers = await context.GamePlays
        .Where(gp => gp.GameId == gameId)
        .Include(gp => gp.GamePlaysNumbers)
        .ToListAsync();

    // 3. Group og beregn matches i C# (client-side)
    var userMatches = gamePlaysWithNumbers
        .GroupBy(gp => gp.UserId)
        .Select(g =>
        {
            var playsWithMatches = g.Select(p => new
            {
                Play = p,
                MatchCount = p.GamePlaysNumbers.Count(n => winningNumbers.Contains(n.Number)),
                Cost = GamePricing.CalculateBoardPrice(p.GamePlaysNumbers.Count)
            })
            .Where(p => p.MatchCount >= 3) // Only winning plays
            .ToList();

            if (playsWithMatches.Count == 0)
                return null;

            return new
            {
                UserId = g.Key,
                BestMatchCount = playsWithMatches.Max(p => p.MatchCount),
                WinningPlaysCount = playsWithMatches.Count,
                TotalCost = playsWithMatches.Sum(p => p.Cost),
                PlayIds = playsWithMatches.Select(p => p.Play.Id).ToList()
            };
        })
        .Where(x => x != null)
        .OrderByDescending(x => x.BestMatchCount)
        .ThenByDescending(x => x.WinningPlaysCount)
        .ToList();

    // 4. Apply pagination in memory
    var totalCount = userMatches.Count;
    var page = Math.Max(1, request.Page);
    var pageSize = Math.Clamp(request.PageSize, 1, 100);
    
    var pagedMatches = userMatches
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToList();

    if (pagedMatches.Count == 0)
    {
        return new PagedResult<UserWinnerDto>
        {
            Items = [],
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    // 5. Hent user data
    var userIds = pagedMatches.Select(x => x.UserId).ToList();
    var users = await context.Users
        .Where(u => userIds.Contains(u.Id))
        .Select(u => new
        {
            User = u,
            Balance = u.UsersBalances.Sum(b => b.Amount)
        })
        .ToDictionaryAsync(x => x.User.Id);

    // 6. Hent matched numbers - grouped by PlayId to keep winning plays separate
    var playIds = pagedMatches.SelectMany(x => x.PlayIds).ToList();
    var playedNumbersLookup = await context.GamePlaysNumbers
        .Where(gpn => playIds.Contains(gpn.PlayId))
        .GroupBy(gpn => gpn.PlayId)
        .ToDictionaryAsync(
            g => g.Key,
            g => g.Select(x => x.Number).OrderBy(n => n).ToList()
        );

    // 7. Build the winning numbers array for each user
    var userWinningNumbersLookup = pagedMatches.ToDictionary(
        x => x.UserId,
        x => x.PlayIds
            .Select(playId => playedNumbersLookup.GetValueOrDefault(playId, []))
            .Where(numbers => numbers.Count > 0)
            .ToList()
    );

    // 8. Byg DTO'er
    var winners = pagedMatches.Select(x =>
    {
        var userData = users[x.UserId];
        return UserWinnerDto.FromDatabase(
            userData.User,
            (int)userData.Balance,
            x.WinningPlaysCount,
            userWinningNumbersLookup.GetValueOrDefault(x.UserId, []),
            (int)x.TotalCost
        );
    }).ToList();

    return new PagedResult<UserWinnerDto>
    {
        Items = winners,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
    public async Task<PagedResult<GameExtendedDto>> GetAllGamesAsync(PaginationRequest request)
    {
        // vi skal først have alt data...
        var pagedGames = await context.Games
            .Include(g => g.GamePlays)
            .ThenInclude(p => p.GamePlaysNumbers)
            .Include(g => g.GameWinningNumbers)
            .OrderByDescending(g => g.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var totalCount = await context.Games.CountAsync();

        // udregn i memory pga vores paged driller lidt
        var items = pagedGames.Select(g =>
        {
            var playCount = g.GamePlays.Count;

            var totalRevenue = g.GamePlays.Sum(p =>
            {
                var fieldCount = p.GamePlaysNumbers.Count;
                var pricePerBoard = GamePricing.CalculateBoardPrice(fieldCount);
                return pricePerBoard;
            });

            // udregn alle vindere - count ALL winning plays, not unique users
            var winningNumbers = g.GameWinningNumbers.Select(wn => wn.Number).ToList();
            var totalWinners = 0;

            if (winningNumbers.Count > 0)
            {
                totalWinners = g.GamePlays
                    .Count(play =>
                        play.GamePlaysNumbers.Count(n => winningNumbers.Contains(n.Number)) >= 3
                    );
            }

            return GameExtendedDto.ExtendedFromDatabase(
                g,
                playCount,
                totalRevenue,
                totalWinners
            );
        }).ToList();

        return new PagedResult<GameExtendedDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
    
    public async Task<Result<GameExtendedDto>> GetGameDetailsAsync(Guid gameId)
    {
        // find spillet
        var game = await context.Games
            .Include(g => g.GamePlays)
            .ThenInclude(p => p.GamePlaysNumbers)
            .Include(g => g.GameWinningNumbers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            return Result<GameExtendedDto>.NotFound("game", "Game not found.");

        // udregn statistik
        var playCount = game.GamePlays.Count;

        var totalRevenue = game.GamePlays.Sum(p =>
        {
            var fieldCount = p.GamePlaysNumbers.Count;
            var pricePerBoard = GamePricing.CalculateBoardPrice(fieldCount);
            return pricePerBoard;
        });

        // udregn alle vindere
        var winningNumbers = game.GameWinningNumbers.Select(wn => wn.Number).ToList();
        var totalWinners = 0;

        if (winningNumbers.Count > 0)
        {
            totalWinners = game.GamePlays
                .Count(play =>
                    play.GamePlaysNumbers.Count(n => winningNumbers.Contains(n.Number)) >= 3
                );
        }

        var gameDto = GameExtendedDto.ExtendedFromDatabase(
            game,
            playCount,
            totalRevenue,
            totalWinners
        );

        return Result<GameExtendedDto>.Ok(gameDto);
    }
    
}