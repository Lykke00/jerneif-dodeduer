namespace Service.DTO.User;

public class UserDtoExtended : UserDto
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string FullName => $"{FirstName} {LastName}";
    public int TotalDeposits { get; set; }
    
    public static UserDtoExtended FromDatabase(DataAccess.Models.User u)
    {
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

            Balance = u.DepositUsers
                .Where(d => d.StatusEnum == DataAccess.Models.Deposit.DepositStatus.Approved)
                .Sum(d => d.Amount),

            TotalDeposits = u.DepositUsers
                .Count(d => d.StatusEnum == DataAccess.Models.Deposit.DepositStatus.Approved)
        };
    }

}