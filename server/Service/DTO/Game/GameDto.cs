namespace Service.DTO.Game;

public class GameDto
{
    public Guid Id { get; set; }
    public int Week { get; set; }
    public int Year { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public static GameDto FromDatabase(DataAccess.Models.Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            Week = game.Week,
            Year = game.Year,
            CreatedAt = game.CreatedAt
        };
    }
}