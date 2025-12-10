namespace Service.DTO.User;

public class AllUserRequest : PaginationRequest
{
    public string? Search { get; set; }
    public bool? Active { get; set; }
}