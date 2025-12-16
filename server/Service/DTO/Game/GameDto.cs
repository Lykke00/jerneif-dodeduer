namespace Service.DTO.Game;

public class GameDto
{
    public Guid Id { get; set; }
    public int Week { get; set; }
    public int Year { get; set; }
    public List<int>? WinningNumbers { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public static GameDto FromDatabase(DataAccess.Models.Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            Week = game.Week,
            Year = game.Year,
            WinningNumbers = game.GameWinningNumbers
                .OrderBy(wn => wn.Number)
                .Select(wn => wn.Number)
                .ToList(),
            CreatedAt = game.CreatedAt
        };
    }
}