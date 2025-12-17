using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("board_played_games")]
[Index("BoardId", "GameId", Name = "board_played_games_board_id_game_id_key", IsUnique = true)]
public partial class BoardPlayedGame
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("board_id")]
    public Guid BoardId { get; set; }

    [Column("game_id")]
    public Guid GameId { get; set; }

    [Column("repeat_plan_id")]
    public Guid? RepeatPlanId { get; set; }

    [Column("success")]
    public bool Success { get; set; }

    [Column("message")]
    public string? Message { get; set; }

    [Column("played_at")]
    public DateTime PlayedAt { get; set; }

    [ForeignKey("BoardId")]
    [InverseProperty("BoardPlayedGames")]
    public virtual GameBoard Board { get; set; } = null!;

    [ForeignKey("GameId")]
    [InverseProperty("BoardPlayedGames")]
    public virtual Game Game { get; set; } = null!;

    [ForeignKey("RepeatPlanId")]
    [InverseProperty("BoardPlayedGames")]
    public virtual BoardRepeatPlan? RepeatPlan { get; set; }
}
