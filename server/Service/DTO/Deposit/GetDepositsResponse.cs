namespace Service.DTO.Deposit;

public class GetDepositsResponse : DepositResponse
{
    public DateTime? ApprovedAt { get; set; }
}