namespace Service.DTO.User;

public class UpdateUserRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public bool? Active { get; set; }
    public bool? Admin { get; set; }
}