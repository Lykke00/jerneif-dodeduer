namespace Service.DTO.User;

public class CreateUserGameBoardRequest
{
    public List<int> Numbers { get; set; } = new();
    public int RepeatCount { get; set; }
}