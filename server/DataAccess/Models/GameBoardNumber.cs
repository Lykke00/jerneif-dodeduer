using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[PrimaryKey("BoardId", "Number")]
[Table("game_board_numbers")]
public partial class GameBoardNumber
{
    [Key]
    [Column("board_id")]
    public Guid BoardId { get; set; }

    [Key]
    [Column("number")]
    public int Number { get; set; }

    [ForeignKey("BoardId")]
    [InverseProperty("GameBoardNumbers")]
    public virtual GameBoard Board { get; set; } = null!;
}
