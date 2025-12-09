using Service.DTO.User;

namespace Service.DTO.Deposit;

public class GetDepositsResponse : DepositResponse
{
    public DateTime? ApprovedAt { get; set; }
    public UserDto User { get; set; } = null!;
}