using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("games")]
[Index("Active", Name = "idx_games_active")]
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

    [Column("active")]
    public bool Active { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("Game")]
    public virtual ICollection<UsersBalance> UsersBalances { get; set; } = new List<UsersBalance>();
}
