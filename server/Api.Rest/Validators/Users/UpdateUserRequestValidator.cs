using FluentValidation;
using Service.DTO.User;

namespace Api.Rest.Validators.Users;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.FirstName));
        
        RuleFor(x => x.LastName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.LastName));
        
        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Email must be a valid email address")
            .When(x => !string.IsNullOrEmpty(x.Email));
        
        RuleFor(x => x.Phone)
            .InclusiveBetween(10000000, 99999999)
            .WithMessage("Telefonnummer skal bestå af præcis 8 cifre")
            .When(x => x.Phone.HasValue);
    }
}