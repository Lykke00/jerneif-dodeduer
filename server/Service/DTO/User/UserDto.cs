namespace Service.DTO.User;

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public bool IsAdmin { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public static UserDto FromDatabase(DataAccess.Models.User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            IsAdmin = user.Admin,
            IsActive = user.Active,
            CreatedAt = user.CreatedAt
        };
    }
}