using FluentValidation;
using Service.DTO.Game;

namespace Api.Rest.Validators.Game;

public class GameUpdateRequestValidator : AbstractValidator<GameUpdateRequest>
{
    public GameUpdateRequestValidator()
    {
        RuleFor(x => x.WinningNumbers)
            .NotNull().WithMessage("Winning numbers must not be null")
            .Must(numbers => numbers.Count == 3).WithMessage("There must be exactly 3 winning numbers")
            .Must(numbers => numbers.All(n => n >= 1 && n <= 16)).WithMessage("Winning numbers must be between 1 and 16")
            .Must(numbers => numbers.Distinct().Count() == numbers.Count).WithMessage("Winning numbers must be unique");
    }
}