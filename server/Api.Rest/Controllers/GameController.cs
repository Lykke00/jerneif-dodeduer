using Api.Rest.Extensions;
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
}