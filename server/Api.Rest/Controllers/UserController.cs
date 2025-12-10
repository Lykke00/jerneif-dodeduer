using DataAccess.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.DTO;
using Service.DTO.User;
using Service.Services.User;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles="admin")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet("all")]
    public async Task<PagedResult<UserDtoExtended>> GetUsers([FromQuery] AllUserRequest request)
    {
        return await userService.GetUsersAsync(request);
    }
}