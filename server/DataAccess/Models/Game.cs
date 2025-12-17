using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("games")]
[Index("Week", "Year", Name = "idx_games_week_year", IsUnique = true)]
public partial class Game
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("week")]
    public int Week { get; set; }

    [Column("year")]
    public int Year { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("StartGame")]
    public virtual ICollection<BoardRepeatPlan> BoardRepeatPlans { get; set; } = new List<BoardRepeatPlan>();

    [InverseProperty("Game")]
    public virtual ICollection<GamePlay> GamePlays { get; set; } = new List<GamePlay>();

    [InverseProperty("Game")]
    public virtual ICollection<GameWinningNumber> GameWinningNumbers { get; set; } = new List<GameWinningNumber>();
}
