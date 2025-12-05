using DataAccess.Repository;
using Service.DTO;
using Service.DTO.User;
using DbUser = DataAccess.Models.User;

namespace Service.Services.User;

public interface IUserService
{
    Task<Result<UserDto>> GetByIdAsync(Guid userId);
}

public class UserService(IRepository<DbUser> userRepository) : IUserService
{
    public async Task<Result<UserDto>> GetByIdAsync(Guid userId)
    {
        var user = await userRepository.FindAsync(userId);
        if (user == null)
            return Result<UserDto>.NotFound("User not found.");

        var createdDto = UserDto.FromDatabase(user);
        return Result<UserDto>.Ok(createdDto);
    }
}