using DataAccess.DTO;
using DataAccess.Repository;
using Microsoft.EntityFrameworkCore;
using Service.DTO;
using Service.DTO.User;
using DbUser = DataAccess.Models.User;

namespace Service.Services.User;

public interface IUserService
{
    Task<Result<UserDto>> GetByIdAsync(Guid userId);
    Task<PagedResult<UserDtoExtended>> GetUsersAsync(AllUserRequest request);
    Task<Result<UserDtoExtended>> CreateUserAsync(CreateUserRequest request);
    Task<Result<UserDtoExtended>> UpdateUserAsync(Guid userId, UpdateUserRequest request);
}

public class UserService(IRepository<DbUser> userRepository) : IUserService
{
    public async Task<Result<UserDto>> GetByIdAsync(Guid userId)
    {
        var user = await userRepository.Query()
            .Include(d => d.DepositUsers)
            .Include(d => d.UsersBalances)
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        if (user == null)
            return Result<UserDto>.NotFound("User not found.");

        var createdDto = UserDto.FromDatabase(user);
        return Result<UserDto>.Ok(createdDto);
    }
    
    public async Task<PagedResult<UserDtoExtended>> GetUsersAsync(AllUserRequest request)
    {
        IQueryable<DbUser> query = userRepository.Query()
            .Include(d => d.DepositUsers)
            .Include(d => d.UsersBalances);
        
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            query = query.Where(d =>
                d.Email.Contains(search));
        }
        
        if (request.Active.HasValue)
            query = query.Where(x => x.Active == request.Active.Value);

        return await userRepository.GetPagedAsync(
            query,
            request.Page,
            request.PageSize,
            orderByDesc: x => x.CreatedAt,
            selector: u => UserDtoExtended.ExtendedFromDatabase(u)
            );
    }
    
    public async Task<Result<UserDtoExtended>> CreateUserAsync(CreateUserRequest request)
    {
        var email = request.Email;
        var exists = await userRepository.Query().AnyAsync(u => u.Email.ToLower() == email.ToLower());
        if (exists)
            return Result<UserDtoExtended>.BadRequest("email", "A user with this email already exists.");
        
        var newUser = new DbUser
        {
            Email = request.Email,
            Admin = request.Admin,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Active = true
        };

        await userRepository.Add(newUser);
        return Result<UserDtoExtended>.Ok(UserDtoExtended.ExtendedFromDatabase(newUser));
    }
    
    public async Task<Result<UserDtoExtended>> UpdateUserAsync(Guid userId, UpdateUserRequest request)
    {
        var user = await userRepository.FindAsync(userId);
        if (user == null)
            return Result<UserDtoExtended>.NotFound("User not found.");
        
        if (request.Active.HasValue)
            user.Active = request.Active.Value;
        
        if (request.Admin.HasValue)
            user.Admin = request.Admin.Value;
        
        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;
        
        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var exists = await  userRepository.Query().AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (exists) 
                return Result<UserDtoExtended>.BadRequest("email", "A user with this email already exists.");

            user.Email = request.Email;
        }

        if (!string.IsNullOrWhiteSpace(request.Phone))
            user.Phone = request.Phone;
        
        
        await userRepository.Update(user);
        return Result<UserDtoExtended>.Ok(UserDtoExtended.ExtendedFromDatabase(user));
    }
}