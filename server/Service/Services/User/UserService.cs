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
        // få fat i bruger, hvor vi inkluder/joiner depositUsers og bruger balance.
        // vælg kun den første hvor brugerId = request.Id
        var user = await userRepository.Query()
            .Include(d => d.DepositUsers)
            .Include(d => d.UsersBalances)
            .FirstOrDefaultAsync(u => u.Id == userId);
        
        // hvis bruger er null, så må han ikke eksistere
        if (user == null)
            return Result<UserDto>.NotFound("User not found.");

        // lav om til DTO og returner til bruger
        var createdDto = UserDto.FromDatabase(user);
        return Result<UserDto>.Ok(createdDto);
    }
    
    
    public async Task<PagedResult<UserDtoExtended>> GetUsersAsync(AllUserRequest request)
    {
        // start med at opret en query og inkluder/join depositUsers og usersbalance på.
        IQueryable<DbUser> query = userRepository.Query()
            .Include(d => d.DepositUsers)
            .Include(d => d.UsersBalances);
        
        // hvis søgefeltet har en værdi, så går vi udfra man søger
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();

            // søg efter brugerens email kun
            query = query.Where(d =>
                d.Email.Contains(search));
        }
        
        // hvis man aktiv feltet har en værdi
        // så query hvor brugerne er aktive eller inaktive
        // hvis feltet ikke har en værdi, bliver ALLE brugere taget med
        if (request.Active.HasValue)
            query = query.Where(x => x.Active == request.Active.Value);

        // returner til bruger som paginatd, med sider osv.
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
        // få fat i emailen
        var email = request.Email;
        var exists = await userRepository.Query().AnyAsync(u => u.Email.ToLower() == email.ToLower());
        
        // hvis emailen eksisterer, så returner en fejl. vi kan ikke have 2 brugere med samme email
        if (exists)
            return Result<UserDtoExtended>.BadRequest("email", "A user with this email already exists.");
        
        // opret den nye bruger
        var newUser = new DbUser
        {
            Email = request.Email,
            Admin = request.Admin,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Active = true
        };

        // tilføj til databasen
        await userRepository.Add(newUser);
        
        // returner til bruger
        return Result<UserDtoExtended>.Ok(UserDtoExtended.ExtendedFromDatabase(newUser));
    }
    
    public async Task<Result<UserDtoExtended>> UpdateUserAsync(Guid userId, UpdateUserRequest request)
    {
        // få fat i brugeren ud fra request.UserId
        var user = await userRepository.FindAsync(userId);
        
        // hvis bruger er null, går vi udfra han ikke eksisterer
        if (user == null)
            return Result<UserDtoExtended>.NotFound("User not found.");
        
        // hvis aktiv har en værdi, så opdater den i databasen
        if (request.Active.HasValue)
            user.Active = request.Active.Value;
        
        // hvis admin har en værdi, så opdater den i databasen
        if (request.Admin.HasValue)
            user.Admin = request.Admin.Value;
        
        // hvis firstName ikke er tom eller null, så opdater den i databasen
        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;
        
        // hvis lastName ikke er tom eller null, så opdater den i databasen
        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;

        // hvis email ikke er tom eller null, så opdater den i databasen
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            // tjek først om mailen allerede eksisterer
            var exists = await  userRepository.Query().AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            
            // hvis den gør det, så returner en fejl til brugeren
            if (exists) 
                return Result<UserDtoExtended>.BadRequest("email", "A user with this email already exists.");

            // opdater email i databasen
            user.Email = request.Email;
        }

        // hvis telefon nummeret ikke er tom eller null, så opdater i databasen
        if (!string.IsNullOrWhiteSpace(request.Phone))
            user.Phone = request.Phone;
        
        // gem ændringer
        await userRepository.Update(user);
        
        // returner til bruger
        return Result<UserDtoExtended>.Ok(UserDtoExtended.ExtendedFromDatabase(user));
    }
}