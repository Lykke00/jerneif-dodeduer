using FluentValidation;
using Service.DTO.Auth.Login;

namespace Api.Rest.Validators.Auth;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}