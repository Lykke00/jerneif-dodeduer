using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("game_boards")]
public partial class GameBoard
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Board")]
    public virtual ICollection<BoardRepeatPlan> BoardRepeatPlans { get; set; } = new List<BoardRepeatPlan>();

    [InverseProperty("Board")]
    public virtual ICollection<GameBoardNumber> GameBoardNumbers { get; set; } = new List<GameBoardNumber>();

    [ForeignKey("UserId")]
    [InverseProperty("GameBoards")]
    public virtual User User { get; set; } = null!;
}
