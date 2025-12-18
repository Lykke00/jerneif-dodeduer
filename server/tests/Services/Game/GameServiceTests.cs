using DataAccess;
using Service.DTO.Game;
using Service.Services.Game;

namespace tests.Services.Game;

public class GameServiceTests
{
    private readonly AppDbContext _db;
    private readonly IGameService _service;

    public GameServiceTests(AppDbContext db, IGameService service)
    {
        _db = db;
        _service = service;
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
}
