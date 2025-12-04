namespace Service.DTO.Auth.Login;

public class LoginResponse
{
    public JwtToken Token { get; set; } = null!;
}