using FluentValidation;
using Service.DTO.User;

namespace Api.Rest.Validators.Users;

public class CreateUserGameBoardRequestValidator : AbstractValidator<CreateUserGameBoardRequest>
{
    public CreateUserGameBoardRequestValidator()
    {
        RuleFor(x => x.Numbers)
            .NotEmpty().WithMessage("Numbers list cannot be empty.")
            .Must(numbers => numbers.Distinct().Count() == numbers.Count)
            .WithMessage("Numbers must be unique.")
            .Must(numbers => numbers.All(n => n >= 1 && n <= 16))
            .WithMessage("Numbers must be between 1 and 16.")
            .Must(numbers => numbers.Count >= 5 && numbers.Count <= 8)
            .WithMessage("5-8 Numbers must be provided.");
        
        RuleFor(x => x.RepeatCount)
            .GreaterThan(0).WithMessage("Repeat count must be greater than zero.");
    }
}