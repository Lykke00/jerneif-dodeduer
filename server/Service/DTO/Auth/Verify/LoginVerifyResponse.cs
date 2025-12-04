using Service.Models;

namespace Service.DTO.Auth.Verify;

public class LoginVerifyResponse
{
    public JwtPair Jwt { get; set; } = null!;
}