using Api.Rest.Requests;
using FluentValidation;

namespace Api.Rest.Validators.Deposit;

public class DepositCreateRequestValidator : AbstractValidator<DepositCreateRequest>
{
    public DepositCreateRequestValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Deposit amount must be greater than zero.");

        // validerer payment id hvis billede ikke er opgivet
        RuleFor(x => x.PaymentId)
            .NotEmpty()
            .When(x => x.PaymentPicture == null)
            .WithMessage("Payment ID is required when Payment Picture is not provided.");

        // validerer billede hvis payment id ikke er opgivet
        RuleFor(x => x.PaymentPicture)
            .NotNull()
            .When(x => string.IsNullOrWhiteSpace(x.PaymentId))
            .WithMessage("Payment Picture is required when Payment ID is not provided.");
        
        // samlet validering for at sikre mindst en er opgivet
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.PaymentId) || x.PaymentPicture != null)
            .WithMessage("Either Payment ID or Payment Picture must be provided.");

    }
}