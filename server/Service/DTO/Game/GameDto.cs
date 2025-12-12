namespace Service.DTO.Game;

public class GameDto
{
    public Guid Id { get; set; }
    public int Week { get; set; }
    public int Year { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public static GameDto FromDatabase(DataAccess.Models.Game game)
    {
        return new GameDto
        {
            Id = game.Id,
            Week = game.Week,
            Year = game.Year,
            IsActive = game.Active,
            CreatedAt = game.CreatedAt
        };
    }
}