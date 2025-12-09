namespace Service.DTO.Deposit;

public class DepositRequest
{
    public decimal Amount { get; set; }
    public string PaymentId { get; set; } = string.Empty;
    public Stream? PaymentPicture { get; set; }
}