using Service.DTO.User;

namespace Service.DTO.Game;

public class UserWinnerDto : UserDto
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName => $"{FirstName} {LastName}";
    public List<List<int>> PlayedNumbers { get; set; } = new();
    public int WinningPlays { get; set; }
    public int TotalSpent { get; set; }

    public static UserWinnerDto FromDatabase(DataAccess.Models.User user, int balance, int winningPlays, List<List<int>> winningNumbers, int totalSpent)
    {
        return new UserWinnerDto
        {
            Id = user.Id,
            Email = user.Email,
            IsAdmin = user.Admin,
            FirstName = user.FirstName,
            LastName = user.LastName,
            IsActive = user.Active,
            CreatedAt = user.CreatedAt,
            Balance = balance,
            WinningPlays = winningPlays,
            PlayedNumbers = winningNumbers,
            TotalSpent = totalSpent
        };
    }
}