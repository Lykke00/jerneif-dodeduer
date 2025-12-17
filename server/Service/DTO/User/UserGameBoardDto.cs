namespace Service.DTO.User;

public class UserGameBoardDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public int RepeatCount { get; set; }
    public int PlayedCount { get; set; }
    public bool Active { get; set; }
    public int PricePerGame { get; set; }
    public int TotalPrice { get; set; }
    public List<int> Numbers { get; set; } = null!;

    public DateTime? StoppedAt { get; set; }
}