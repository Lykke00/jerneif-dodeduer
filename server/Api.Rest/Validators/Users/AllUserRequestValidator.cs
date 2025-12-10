using FluentValidation;
using Service.DTO.User;

namespace Api.Rest.Validators.Users;

public class AllUserRequestValidator : AbstractValidator<AllUserRequest>
{
    public AllUserRequestValidator()
    {
        RuleFor(x => x.Search)
            .MaximumLength(100).WithMessage("Search term must be at most 100 characters long.");
    }   
}