namespace Service.DTO.User;

public class UserGameBoardAllRequest : PaginationRequest
{
    public bool? Active { get; set; }
}