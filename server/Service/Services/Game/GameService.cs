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
        // find et spil ud fra game id, inkluder/join vindertal på og hvor gameId = request id
        var game = await context.Games
            .Include(g => g.GameWinningNumbers)
            .FirstOrDefaultAsync(g => g.Id == gameId);
        
        // hvis game er null, så må den ikke eksisterer
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

        // hvis game er null, så må den ikke eksisterer
        if (game == null)
            return Result<GameDto>.NotFound("No active game found.");

        // returner til bruger
        return Result<GameDto>.Ok(GameDto.FromDatabase(game));
    }
    
    private static GamePlay CreateGamePlay(
        Guid userId,
        Guid gameId,
        IEnumerable<int> numbers)
    {
        // lav et nyt ID
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

        // returner
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

            // få fat i brugerens balance og udregn sum
            var balance = await context.UsersBalances
                .Where(x => x.UserId == userId)
                .SumAsync(x => x.Amount);

            // total pris er brættetspris * antal man vil spille den
            var totalPrice = boardPrice * request.Amount;
            
            // hvis balancen er mindre end total pris, så har man ikke råd
            if (balance < totalPrice)
                return Result<GameUserPlayResponse>.Conflict("balance", "Insufficient balance to play this board.");

            // for hver gang man vil spille
            for (var i = 0; i < request.Amount; i++)
            {
                // opret et nyt gameplay (træk)
                var gamePlay = CreateGamePlay(userId, gameId, request.Numbers);

                // træk fra brugerens balance
                await balanceService.AddPlayAsync(userId, gamePlay.Id, boardPrice);
                
                // tilføj til databasen
                context.GamePlays.Add(gamePlay);
            }
            
            // gem ændringerne og commit transaktionen
            await context.SaveChangesAsync();
            await tx.CommitAsync();

            // få fat i den nye opdateret balance
            var newBalance = await context.UsersBalances
                .Where(x => x.UserId == userId)
                .SumAsync(x => x.Amount);
            
            // returner til brugeren
            return Result<GameUserPlayResponse>.Ok(new GameUserPlayResponse
            {
                TotalPrice = totalPrice,
                NewBalance = newBalance
            });
        }
        catch
        {
            // hvis en fejl sker, så roll ændringer tilbage og returner en fejl.
            await tx.RollbackAsync();
            return Result<GameUserPlayResponse>.InternalError("An error occurred while processing the game play.");
        }
    }
    
    public async Task<Result<GameDto>> UpdateGameAsync(Guid gameId, GameUpdateRequest request)
    {
        // find spillet, inkluder/join vindertal på og tjek gameId = request.gameId
        var game = await context.Games
            .Include(g => g.GameWinningNumbers)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        // hvis spillet er null, så må den ikke eksisterer
        if (game == null)
            return Result<GameDto>.NotFound("game", "Game not found.");

        // opdater spillets vindende numre
        game.GameWinningNumbers.Clear();
        
        // for hver nummer i vindertal numre.
        foreach (var number in request.WinningNumbers)
        {
            // tilføj hvert nummer til tabellen med gameId og nummeret.
            game.GameWinningNumbers.Add(new GameWinningNumber
            {
                GameId = gameId,
                Number = number
            });
        }
        
        // gem i databasen
        await context.SaveChangesAsync();
        
        // få fat i det opdateret spil, inkluder/join vindertal på og tjek gameId = request.Id
        var updatedGame = await context.Games
            .Include(g => g.GameWinningNumbers)
            .AsNoTracking()
            .FirstAsync(g => g.Id == gameId);

        // returner til brugeren
        return Result<GameDto>.Ok(GameDto.FromDatabase(updatedGame));    
    }
    
public async Task<Result<GameDto>> CreateGameAsync(GameCreateRequest request)
{
    // skal køres i en transaktion da "auto" brætne også spilles her
    await using var tx = await context.Database.BeginTransactionAsync(
        IsolationLevel.Serializable);

    try
    {
        // tjek om spillet allerede findes
        var activeGameExists = await context.Games
            .AnyAsync(g => !g.GameWinningNumbers.Any());
        
        // hvis spillet findes, så kan vi ikke fortsætte
        if (activeGameExists)
            return Result<GameDto>.Conflict("game", "Game game already exists.");
        
        // eksisterer der en for denne uge og år
        var existsForThisWeekYear = await context.Games
            .AnyAsync(g => g.Week == request.WeekNumber &&
                           g.Year == DateTime.UtcNow.Year);

        // hvis den eksisterer for denne uge og år, så meld fejl tilbage
        if (existsForThisWeekYear)
            return Result<GameDto>.Conflict(
                "Week",
                "Game game already exists for this week and year."
            );

        // opret et nyt spil
        var newGame = new DataAccess.Models.Game
        {
            Id = Guid.NewGuid(),
            Week = request.WeekNumber,
            Year = DateTime.UtcNow.Year,
            CreatedAt = DateTime.UtcNow
        };

        // tilføj til databasen
        context.Games.Add(newGame);
        await context.SaveChangesAsync();

        // hent alle aktive boards med deres repeat plans
        var activeBoards = await context.GameBoards
            .Include(b => b.GameBoardNumbers)
            .Include(b => b.BoardRepeatPlans)
            .Where(b => b.BoardRepeatPlans.Any(rp => rp.Active))
            .Select(b => new
            {
                Board = b,
                ActivePlan = b.BoardRepeatPlans.First(rp => rp.Active),
                Numbers = b.GameBoardNumbers.Select(n => n.Number).ToList(),
                NumberCount = b.GameBoardNumbers.Count
            })
            .ToListAsync();

        // processer hvert aktiv board
        foreach (var boardData in activeBoards)
        {
            var userId = boardData.Board.UserId;
            var repeatCount = boardData.ActivePlan.RepeatCount;
            var playedCount = boardData.ActivePlan.PlayedCount;
            
            // tjek om board har nået sit limit
            if (playedCount >= repeatCount)
            {
                // deaktiver planen hvis den er færdig
                boardData.ActivePlan.Active = false;
                boardData.ActivePlan.StoppedAt = DateTime.UtcNow;
                continue;
            }

            // beregn pris for dette board
            var boardPrice = GamePricing.CalculateBoardPrice(boardData.NumberCount);

            // tjek brugerens balance
            var balance = await context.UsersBalances
                .Where(x => x.UserId == userId)
                .SumAsync(x => x.Amount);

            if (balance < boardPrice)
            {
                // ikke nok balance - deaktiver planen
                boardData.ActivePlan.Active = false;
                boardData.ActivePlan.StoppedAt = DateTime.UtcNow;

                BoardPlayedGame playedGame = new BoardPlayedGame
                {
                    BoardId = boardData.Board.Id,
                    GameId = newGame.Id,
                    PlayedAt = DateTime.UtcNow,
                    RepeatPlanId = boardData.ActivePlan.Id,
                    Message = "Insufficient balance",
                    Success = false
                };
                context.BoardPlayedGames.Add(playedGame);
                continue;
            }

            // opret spillet
            var gamePlay = CreateGamePlay(userId, newGame.Id, boardData.Numbers);
            context.GamePlays.Add(gamePlay);

            // træk beløbet fra balance
            await balanceService.AddPlayAsync(userId, gamePlay.Id, boardPrice);

            // opdater played count
            boardData.ActivePlan.PlayedCount++;

            // deaktiver hvis alle spil er brugt
            if (boardData.ActivePlan.PlayedCount >= boardData.ActivePlan.RepeatCount)
            {
                boardData.ActivePlan.Active = false;
                boardData.ActivePlan.StoppedAt = DateTime.UtcNow;
            }
            
            // det spillet brækt, skal gemmes i databasen så de kan se det i historikken.
            BoardPlayedGame played = new BoardPlayedGame
            {
                BoardId = boardData.Board.Id,
                GameId = newGame.Id,
                PlayedAt = DateTime.UtcNow,
                RepeatPlanId = boardData.ActivePlan.Id,
                Message = "Played successfully",
                Success = true
            };
            context.BoardPlayedGames.Add(played);
        }
        
        // gem ændringer i databasen og commit transaktionen
        await context.SaveChangesAsync();
        await tx.CommitAsync();

        // returner til brugeren
        return Result<GameDto>.Ok(GameDto.FromDatabase(newGame));
    }
    catch (Exception ex)
    {
        // hvis en fejl sker, så roll ændringer tilbage og returner en fejl til brugeren
        await tx.RollbackAsync();
        return Result<GameDto>.InternalError($"An error occurred while creating the game: {ex.Message}");
    }
}
    
public async Task<PagedResult<UserWinnerDto>> GetWinnersAsync(
    Guid gameId,
    PaginationRequest request)
{
    // 1. hent vindertal, hvor gameId = request.gameId og vælg kun alle numre og lav dem til en liste.
    var winningNumbers = await context.GameWinningNumbers
        .Where(x => x.GameId == gameId)
        .Select(x => x.Number)
        .ToListAsync();

    // hvis der ikke er nogle vindertal, så er der en fejl og ingen gyldige.
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

    // 2. hent alle GamePlays med deres numbers for dette spil
    var gamePlaysWithNumbers = await context.GamePlays
        .Where(gp => gp.GameId == gameId)
        .Include(gp => gp.GamePlaysNumbers)
        .ToListAsync();

    // 3. group og beregn matches i C# (client-side)
    var userMatches = gamePlaysWithNumbers
        .GroupBy(gp => gp.UserId)
        .Select(g => new
        {
            UserId = g.Key,
            PlaysWithMatches = g
                .Select(p => new
                {
                    Play = p,
                    MatchCount = p.GamePlaysNumbers.Count(n => winningNumbers.Contains(n.Number)),
                    Cost = GamePricing.CalculateBoardPrice(p.GamePlaysNumbers.Count)
                })
                .Where(p => p.MatchCount >= 3)
                .ToList()
        })
        .Where(x => x.PlaysWithMatches.Any())
        .Select(x => new
        {
            x.UserId,
            BestMatchCount = x.PlaysWithMatches.Max(p => p.MatchCount),
            WinningPlaysCount = x.PlaysWithMatches.Count,
            TotalCost = x.PlaysWithMatches.Sum(p => p.Cost),
            PlayIds = x.PlaysWithMatches.Select(p => p.Play.Id).ToList()
        })
        .OrderByDescending(x => x.BestMatchCount)
        .ThenByDescending(x => x.WinningPlaysCount)
        .ToList();

    // 4. brug pagination men i memory/ram
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

    // 5. hent bruger data
    var userIds = pagedMatches.Select(x => x.UserId).ToList();
    var users = await context.Users
        .Where(u => userIds.Contains(u.Id))
        .Select(u => new
        {
            User = u,
            Balance = u.UsersBalances.Sum(b => b.Amount)
        })
        .ToDictionaryAsync(x => x.User.Id);

    // 6. hent matched numbers - grouped af playid for at holder vinderplays separeret
    var playIds = pagedMatches.SelectMany(x => x.PlayIds).ToList();
    var playedNumbersLookup = await context.GamePlaysNumbers
        .Where(gpn => playIds.Contains(gpn.PlayId))
        .GroupBy(gpn => gpn.PlayId)
        .ToDictionaryAsync(
            g => g.Key,
            g => g.Select(x => x.Number).OrderBy(n => n).ToList()
        );

    // 7. byg vindertals array for hver bruger
    var userWinningNumbersLookup = pagedMatches.ToDictionary(
        x => x.UserId,
        x => x.PlayIds
            .Select(playId => playedNumbersLookup.GetValueOrDefault(playId, []))
            .Where(numbers => numbers.Count > 0)
            .ToList()
    );

    // 8. byg DTO'er
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

    // returner til brugeren
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
            .Include(g => g.GamePlays)                      // join gameplays
            .ThenInclude(p => p.GamePlaysNumbers)           // derefter join gameplaynumbers
            .Include(g => g.GameWinningNumbers)             // join gamewinningnumbers
            .OrderByDescending(g => g.CreatedAt)            // sørg for nyeste står først
            .Skip((request.Page - 1) * request.PageSize)    // brug pagination
            .Take(request.PageSize)                         // tag kun så mange med, så stor siden er
            .ToListAsync();                                 // lav om til en liste

        var totalCount = await context.Games.CountAsync();

        // udregn i memory pga vores paged driller lidt
        var items = pagedGames.Select(g =>
        {
            var playCount = g.GamePlays.Count;

            // tjek omsætning af spillet, ved at udregne sum
            var totalRevenue = g.GamePlays.Sum(p =>
            {
                var fieldCount = p.GamePlaysNumbers.Count;
                var pricePerBoard = GamePricing.CalculateBoardPrice(fieldCount);
                return pricePerBoard;
            });

            // udregn alle vindere - count ALL winning plays, not unique users
            var winningNumbers = g.GameWinningNumbers.Select(wn => wn.Number).ToList();
            var totalWinners = 0;

            // hvis vindertal er højere end 0 så
            if (winningNumbers.Count > 0)
            {
                // udregn hvor mange vindere der er ialt
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

        // returner til brugeren
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

        // hvis spillet er null, så må det ikke eksisterer
        if (game == null)
            return Result<GameExtendedDto>.NotFound("game", "Game not found.");

        // udregn statistik
        var playCount = game.GamePlays.Count;

        // total omsætning fra spillet
        var totalRevenue = game.GamePlays.Sum(p =>
        {
            var fieldCount = p.GamePlaysNumbers.Count;
            var pricePerBoard = GamePricing.CalculateBoardPrice(fieldCount);
            return pricePerBoard;
        });

        // udregn alle vindere
        var winningNumbers = game.GameWinningNumbers.Select(wn => wn.Number).ToList();
        var totalWinners = 0;
        
        // hvis vindertal er højere end 0 så
        if (winningNumbers.Count > 0)
        {
            // udregn hvor mange vindere der er ialt
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

        // returner til bruger
        return Result<GameExtendedDto>.Ok(gameDto);
    }
    
}