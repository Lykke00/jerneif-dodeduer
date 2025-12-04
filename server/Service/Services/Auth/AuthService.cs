using Service.DTO.Auth.Login;

namespace Service.Services.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    public Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        throw new NotImplementedException();
    }
}