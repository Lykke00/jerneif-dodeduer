namespace Service.DTO.User;

public class UserGameBoardHistoryDto
{
    public required string GameWeek { get; set; }
    public required string Year { get; set; }
    public required int Price { get; set; }
    public required List<int> Numbers { get; set; } = new();
    public required List<int> WinningNumbers { get; set; } = new();
    public required string Message { get; set; }
    public required bool IsSuccess { get; set; }
}