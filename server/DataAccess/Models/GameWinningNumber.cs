using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[PrimaryKey("GameId", "Number")]
[Table("game_winning_numbers")]
public partial class GameWinningNumber
{
    [Key]
    [Column("game_id")]
    public Guid GameId { get; set; }

    [Key]
    [Column("number")]
    public int Number { get; set; }

    [ForeignKey("GameId")]
    [InverseProperty("GameWinningNumbers")]
    public virtual Game Game { get; set; } = null!;
}
