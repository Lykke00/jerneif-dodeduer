namespace Service.DTO.Game;

public class GameUserPlayRequest
{
    public Guid GameId { get; set; }
    
    public int Amount { get; set; }
    public List<int> Numbers { get; set; } = [];
}