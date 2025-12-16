namespace Service.DTO.Game;

public class GameUpdateRequest
{
    public List<int> WinningNumbers { get; set; } = new();
}