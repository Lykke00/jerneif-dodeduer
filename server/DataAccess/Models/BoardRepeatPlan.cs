using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("board_repeat_plans")]
public partial class BoardRepeatPlan
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("board_id")]
    public Guid BoardId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("start_game_id")]
    public Guid StartGameId { get; set; }

    [Column("repeat_count")]
    public int RepeatCount { get; set; }

    [Column("played_count")]
    public int PlayedCount { get; set; }

    [Column("active")]
    public bool Active { get; set; }

    [Column("stopped_at")]
    public DateTime? StoppedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("BoardId")]
    [InverseProperty("BoardRepeatPlans")]
    public virtual GameBoard Board { get; set; } = null!;

    [ForeignKey("StartGameId")]
    [InverseProperty("BoardRepeatPlans")]
    public virtual Game StartGame { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("BoardRepeatPlans")]
    public virtual User User { get; set; } = null!;
}
