using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("game_plays")]
[Index("GameId", "UserId", Name = "idx_game_plays_game_user")]
public partial class GamePlay
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("game_id")]
    public Guid GameId { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("GameId")]
    [InverseProperty("GamePlays")]
    public virtual Game Game { get; set; } = null!;

    [InverseProperty("Play")]
    public virtual ICollection<GamePlaysNumber> GamePlaysNumbers { get; set; } = new List<GamePlaysNumber>();

    [ForeignKey("UserId")]
    [InverseProperty("GamePlays")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("Play")]
    public virtual UsersBalance? UsersBalance { get; set; }
}
