namespace Service.DTO.Deposit;

public class DepositRequest
{
    public decimal Amount { get; set; }
    public string? PaymentId { get; set; }
    public Stream? PaymentPicture { get; set; }
    public string? PaymentPictureFileName { get; set; }
}