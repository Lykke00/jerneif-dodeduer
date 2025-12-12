using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.Game;
using Service.Services.Game;

namespace Api.Rest.Controllers;

//[Authorize]
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
}