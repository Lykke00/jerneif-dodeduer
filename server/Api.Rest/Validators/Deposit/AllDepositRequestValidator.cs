using FluentValidation;
using Service.DTO.Deposit;

namespace Api.Rest.Validators.Deposit;

public class AllDepositRequestValidator : AbstractValidator<AllDepositRequest>
{
    public AllDepositRequestValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0).WithMessage("Page must be greater than 0.");
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100).WithMessage("PageSize must be between 1 and 100.");
        RuleFor(x => x.Status).Must(status => status is null or "pending" or "approved" or "declined")
            .WithMessage("Status must be either 'pending', 'approved', 'declined', or null.");
    }
}