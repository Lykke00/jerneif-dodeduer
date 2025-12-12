using FluentValidation;
using Service.DTO.Game;

namespace Api.Rest.Validators.Game;

public class GameUserPlayRequestValidator : AbstractValidator<GameUserPlayRequest>
{
    public GameUserPlayRequestValidator()
    {
        RuleFor(x => x.GameId)
            .NotEmpty();

        RuleFor(x => x.Numbers)
            .NotNull()
            .Must(n => n.Count is >= 5 and <= 8)
            .WithMessage("You must select between 5 and 8 numbers.");

        RuleForEach(x => x.Numbers)
            .InclusiveBetween(1, 16);

        RuleFor(x => x.Numbers)
            .Must(n => n.Distinct().Count() == n.Count)
            .WithMessage("Numbers must be unique.");
    }
}