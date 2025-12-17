using DataAccess.Models;

namespace Service.DTO.User;

public class UserDtoExtended : UserDto
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string FullName => $"{FirstName} {LastName}";
    public int TotalDeposits { get; set; }
    
    public static UserDtoExtended ExtendedFromDatabase(DataAccess.Models.User u)
    {
        var approvedDepositCount = u.UsersBalances
            .Count(b => b.BalanceEnum == UsersBalance.BalanceType.Deposit);
        
        return new UserDtoExtended
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Phone = u.Phone,
            IsAdmin = u.Admin,
            IsActive = u.Active,
            CreatedAt = u.CreatedAt,

            TotalDeposits = approvedDepositCount
        };
    }

}