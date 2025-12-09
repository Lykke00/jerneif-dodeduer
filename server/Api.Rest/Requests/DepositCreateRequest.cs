namespace Api.Rest.Requests;

public class DepositCreateRequest
{
    public decimal Amount { get; set; }
    public string? PaymentId { get; set; }
    public IFormFile? PaymentPicture { get; set; }
}