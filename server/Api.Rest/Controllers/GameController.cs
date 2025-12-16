using Api.Rest.Extensions;
using DataAccess.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.Game;
using Service.DTO.User;
using Service.Services.Game;

namespace Api.Rest.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GameController(IGameService gameService) : ControllerBase
{
    [HttpGet("current")]
    public async Task<Result<GameDto>> GetCurrentGame()
    {
        return await gameService.GetCurrentGame();
    }
    
    [HttpGet("by-id")]
    public async Task<Result<GameDto>> GetGameByIdAsync([FromQuery] Guid gameId)
    {
        return await gameService.GetGameByIdAsync(gameId);
    }
    
    [HttpPost("play")]
    public async Task<Result<GameUserPlayResponse>> PlayGame([FromBody] GameUserPlayRequest request)
    {
        var id = User.GetUserId();
        if (id == null) return Result<GameUserPlayResponse>.Unauthorized("Not logged in");

        return await gameService.PlayGameAsync(id.Value, request.GameId, request);
    }
    
    [Authorize(Roles = "admin")]
    [HttpPost("{gameId:guid}/update")]
    public async Task<Result<GameDto>> UpdateGame([FromRoute] Guid gameId, [FromBody] GameUpdateRequest request)
    {
        return await gameService.UpdateGameAsync(gameId, request);
    }
    
    [Authorize(Roles = "admin")]
    [HttpPost("{gameId:guid}/winners")]
    public async Task<PagedResult<UserWinnerDto>> GetWinners([FromRoute] Guid gameId, [FromBody] PaginationRequest request)
    {
        return await gameService.GetWinnersAsync(gameId, request);
    }
    
    [Authorize(Roles = "admin")]
    [HttpPost("create")]
    public async Task<Result<GameDto>> CreateGame([FromBody] GameCreateRequest request)
    {
        return await gameService.CreateGameAsync(request);
    }
    
    [Authorize(Roles = "admin")]
    [HttpGet("all")]
    public async Task<PagedResult<GameExtendedDto>> GetAllGames([FromQuery] PaginationRequest request)
    {
        return await gameService.GetAllGamesAsync(request);
    }
    
    [Authorize(Roles = "admin")]
    [HttpGet("details")]
    public async Task<Result<GameExtendedDto>> GetGameDetails([FromQuery] Guid gameId)
    {
        return await gameService.GetGameDetailsAsync(gameId);
    }
}