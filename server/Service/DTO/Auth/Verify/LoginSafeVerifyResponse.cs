using Service.DTO.User;

namespace Service.DTO.Auth.Verify;

public class LoginSafeVerifyResponse
{
    public string Token { get; set; } = null!;
    public UserDto User { get; set; } = null!;
}