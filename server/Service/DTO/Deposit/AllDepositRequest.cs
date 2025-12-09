namespace Service.DTO.Deposit;

public class AllDepositRequest : PaginationRequest
{
    public string? Search { get; set; }
    public string? Status { get; set; }
}