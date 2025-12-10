using FluentValidation;
using Service.DTO.Deposit;

namespace Api.Rest.Validators.Deposit;

public class UpdateDepositStatusRequestValidator : AbstractValidator<UpdateDepositStatusRequest>
{
    public UpdateDepositStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status must be provided.")
            .Must(status => status == "pending" || status == "approved" || status == "declined")
            .WithMessage("Status must be one of the following values: Pending, Approved, Declined.");
    }
}