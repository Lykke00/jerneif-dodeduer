using Api.Rest.Extensions;
using DataAccess.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.User;
using Service.Services.User;

namespace Api.Rest.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserBoardController(IUserBoardService userBoardService) : ControllerBase
{
    [HttpGet("all")]
    public async Task<PagedResult<UserGameBoardDto>> GetAllUserBoards([FromQuery] UserGameBoardAllRequest request)
    {
        var userId = User.GetUserId()
                     ?? throw new UnauthorizedAccessException("User ID not found in token.");

        return await userBoardService.GetUserBoardsAsync(userId, request);
    }
    
    [HttpPost("create")]
    public async Task<Result<UserGameBoardDto>> CreateUserBoard([FromBody] CreateUserGameBoardRequest request)
    {
        var userId = User.GetUserId()
                     ?? throw new UnauthorizedAccessException("User ID not found in token.");

       return await userBoardService.CreateUserBoardAsync(userId, request);
    }
    
    [HttpPost("deactivate/{boardId:guid}")]
    public async Task<Result<bool>> DeactivateUserBoard([FromRoute] Guid boardId)
    {
        var userId = User.GetUserId()
                     ?? throw new UnauthorizedAccessException("User ID not found in token.");

       return await userBoardService.DeactivateUserBoard(userId, boardId);
    }
    
    [HttpGet("{boardId:guid}/history")]
    public async Task<Result<List<UserGameBoardHistoryDto>>> GetUserBoardDetails([FromRoute] Guid boardId)
    {
        var userId = User.GetUserId()
                     ?? throw new UnauthorizedAccessException("User ID not found in token.");

       return await userBoardService.GetHistoryAsync(userId, boardId);
    }
}