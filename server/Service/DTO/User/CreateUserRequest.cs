namespace Service.DTO.User;

public class CreateUserRequest
{
    public string Email { get; set; } = null!;
    public bool Admin { get; set; }
}