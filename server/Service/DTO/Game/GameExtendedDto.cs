namespace Service.DTO.Game;

public class GameExtendedDto : GameDto
{
    public int TotalPlays { get; set; }
    public decimal TotalPrizePool { get; set; }
    public int Winners { get; set; }
    
    public static GameExtendedDto ExtendedFromDatabase(DataAccess.Models.Game game, int totalPlays, decimal totalPrizePool, int winners)
    {
        return new GameExtendedDto
        {
            Id = game.Id,
            Week = game.Week,
            Year = game.Year,
            WinningNumbers = game.GameWinningNumbers
                .OrderBy(wn => wn.Number)
                .Select(wn => wn.Number)
                .ToList(),
            CreatedAt = game.CreatedAt,
            TotalPlays = totalPlays,
            TotalPrizePool = totalPrizePool,
            Winners = winners
        };
    }
}