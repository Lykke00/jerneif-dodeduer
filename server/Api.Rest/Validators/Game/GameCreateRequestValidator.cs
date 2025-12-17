using FluentValidation;
using Service.DTO.Game;

namespace Api.Rest.Validators.Game;

public class GameCreateRequestValidator : AbstractValidator<GameCreateRequest>
{
    public GameCreateRequestValidator()
    {
        RuleFor(x => x.WeekNumber)
            .GreaterThan(0).WithMessage("Week number must be greater than 0");
        
        
    }
}