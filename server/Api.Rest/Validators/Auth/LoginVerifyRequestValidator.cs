using FluentValidation;
using Service.DTO.Auth.Login;

namespace Api.Rest.Validators.Auth;

public class LoginVerifyRequestValidator : AbstractValidator<LoginVerifyRequest>
{
    public LoginVerifyRequestValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty()
            .WithMessage("Verification token must not be empty.")
            .MinimumLength(6)
            .WithMessage("Verification token must be at least 6 characters long.");
    }
}