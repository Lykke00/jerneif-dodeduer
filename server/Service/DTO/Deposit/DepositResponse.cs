namespace Service.DTO.Deposit;

public class DepositResponse
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string PaymentId { get; set; } = string.Empty;
    public string PaymentPictureUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}