using DataAccess;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Service.DTO.Game;
using Service.Helpers;
using Service.Services.Game;
using Service.Services.User;
using tests.Helpers;

namespace tests.Services.Game;

public class GameServiceTests
{
    private readonly AppDbContext _db;
    private readonly IGameService _service;

    private readonly IUserService _userService;
    private readonly IUserBalanceService _balanceService;
    
    public GameServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _db = new AppDbContext(options);

        var userRepository = new UserRepository(_db);
        
        _userService = new UserService(
            userRepository
        );

        _balanceService = new UserBalanceService(
            _db
        );
        
        _service = new GameService(
            _db,
            _userService,
            _balanceService
        );
    }

    [Fact]
    public async Task CreateGame_ValidRequest_ReturnsNewGame()
    {
        // arrange
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        // act
        var createdGame = await _service.CreateGameAsync(request);
        
        // assert
        Assert.NotNull(createdGame.Value);
        Assert.True(createdGame.Success);
        Assert.Equal(200, createdGame.StatusCode);
        Assert.Equal(createdGame.Value.Week, request.WeekNumber);
    }

    [Fact]
    public async Task CreateGame_WeekAndYearExists_ReturnsError()
    {
        // arrange
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        // act
        await _service.CreateGameAsync(request);
        var failedGame = await _service.CreateGameAsync(request);

        // assert
        Assert.Null(failedGame.Value);
        Assert.False(failedGame.Success);
        Assert.Equal(409, failedGame.StatusCode);
    }

    [Fact]
    public async Task GetCurrentGame_ValidRequest_ReturnsCurrentGame()
    {
        // arrange
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        // act
        var created = await _service.CreateGameAsync(request);
        var currentGame = await _service.GetCurrentGame();
        
        Assert.NotNull(created.Value);
        Assert.NotNull(currentGame.Value);
        
        Assert.True(currentGame.Success);
        Assert.Equal(200, currentGame.StatusCode);
        Assert.Equal(currentGame.Value.Week, created.Value.Week);
        Assert.Equal(currentGame.Value.Year, created.Value.Year);
    }
    
    [Fact]
    public async Task GetCurrentGame_NoActiveGame_ReturnsError()
    {
        // act
        var currentGame = await _service.GetCurrentGame();
        
        // assert
        Assert.Null(currentGame.Value);
        
        Assert.False(currentGame.Success);
        Assert.Equal(404, currentGame.StatusCode);
    }

    [Fact]
    public async Task PlayGame_NotEnoughBalance_ReturnsError()
    {
        // arrange
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        var user = await TestDataFactory.CreateUserAsync(_db, "preben@gmail.com");
        var created = await _service.CreateGameAsync(request);
        if (created.Value == null)
            Assert.Fail("A game should be created");

        var playRequest = new GameUserPlayRequest
        {
            Amount = 3,
            GameId = created.Value.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 }
        };
        
        // act
        var play = await _service.PlayGameAsync(user.Id, created.Value.Id, playRequest);
        
        Assert.False(play.Success);
        Assert.Null(play.Value);
        Assert.Equal(409, play.StatusCode);
    }
    
    [Fact]
    public async Task PlayGame_InvalidNumbers_ReturnsError()
    {
        // arrange
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        var user = await TestDataFactory.CreateUserAsync(_db, "preben@gmail.com");
        var created = await _service.CreateGameAsync(request);
        if (created.Value == null)
            Assert.Fail("A game should be created");

        var playRequest = new GameUserPlayRequest
        {
            Amount = 3,
            GameId = created.Value.Id,
            Numbers = new List<int> { 1, 2 }
        };
        
        // act
        var play = await _service.PlayGameAsync(user.Id, created.Value.Id, playRequest);
        
        Assert.False(play.Success);
        Assert.Null(play.Value);
        Assert.Equal(500, play.StatusCode);
    }
    
    [Fact]
    public async Task PlayGame_NoActiveGames_ReturnsError()
    {
        // arrange
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        var user = await TestDataFactory.CreateUserAsync(_db, "preben@gmail.com");
        var created = Guid.NewGuid();

        var playRequest = new GameUserPlayRequest
        {
            Amount = 3,
            GameId = created,
            Numbers = new List<int> { 1, 2 }
        };
        
        // act
        var play = await _service.PlayGameAsync(user.Id, created, playRequest);
        
        Assert.False(play.Success);
        Assert.Null(play.Value);
        Assert.Equal(404, play.StatusCode);
    }
    
    [Fact]
    public async Task PlayGame_ValidRequestAndBalance_ReturnsPlayedDto()
    {
        // arrange
        var startBalance = 100;
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        var user = await TestDataFactory.CreateUserAsync(_db, "preben@gmail.com");
        await TestDataFactory.UpdateBalanceAsync(_db, user.Id, startBalance);
        
        var created = await _service.CreateGameAsync(request);
        if (created.Value == null)
            Assert.Fail("A game should be created");

        var playRequest = new GameUserPlayRequest
        {
            Amount = 2,
            GameId = created.Value.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 }
        };
        
        // act
        var play = await _service.PlayGameAsync(user.Id, created.Value.Id, playRequest);
        
        Assert.True(play.Success);
        Assert.NotNull(play.Value);
        Assert.Equal(200, play.StatusCode);
        Assert.Equal(play.Value.TotalPrice, GamePricing.CalculateBoardPrice(playRequest.Numbers.Count) * playRequest.Amount);
        Assert.Equal(play.Value.NewBalance, startBalance - GamePricing.CalculateBoardPrice(playRequest.Numbers.Count) * playRequest.Amount);
    }

    
    [Fact]
    public async Task UpdateGameWinningNumbers_ValidResponseOneWinner_ReturnsGameDto()
    {
        // arrange
        var startBalance = 100;
        var request = new GameCreateRequest
        {
            WeekNumber = 5
        };
        
        var user = await TestDataFactory.CreateUserAsync(_db, "preben@gmail.com");
        await TestDataFactory.UpdateBalanceAsync(_db, user.Id, startBalance);
        
        var created = await _service.CreateGameAsync(request);
        if (created.Value == null)
            Assert.Fail("A game should be created");

        var playRequest = new GameUserPlayRequest
        {
            Amount = 2,
            GameId = created.Value.Id,
            Numbers = new List<int> { 1, 2, 3, 4, 5 }
        };

        var gameUpdatedRequest = new GameUpdateRequest
        {
            WinningNumbers = new List<int> { 1, 2, 3 }
        };
        
        // act
        await _service.PlayGameAsync(user.Id, created.Value.Id, playRequest);

        var updateGame = await _service.UpdateGameAsync(created.Value.Id, gameUpdatedRequest);
        
        Assert.True(updateGame.Success);
        Assert.NotNull(updateGame.Value);
        Assert.Equal(200, updateGame.StatusCode);
        Assert.Equal(updateGame.Value.WinningNumbers, gameUpdatedRequest.WinningNumbers);
    }

}
