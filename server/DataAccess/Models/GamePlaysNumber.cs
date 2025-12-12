using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[PrimaryKey("PlayId", "Number")]
[Table("game_plays_numbers")]
public partial class GamePlaysNumber
{
    [Key]
    [Column("play_id")]
    public Guid PlayId { get; set; }

    [Key]
    [Column("number")]
    public short Number { get; set; }

    [ForeignKey("PlayId")]
    [InverseProperty("GamePlaysNumbers")]
    public virtual GamePlay Play { get; set; } = null!;
}
