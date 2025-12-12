using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("users_balance")]
[Index("GameId", Name = "idx_users_balance_game_id")]
[Index("UserId", "CreatedAt", Name = "idx_users_balance_user_created_at", IsDescending = new[] { false, true })]
[Index("UserId", Name = "idx_users_balance_user_id")]
public partial class UsersBalance
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("amount")]
    [Precision(12, 2)]
    public decimal Amount { get; set; }

    [Column("type")]
    public string Type { get; set; } = null!;

    [Column("deposit_id")]
    public Guid? DepositId { get; set; }

    [Column("game_id")]
    public Guid? GameId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("DepositId")]
    [InverseProperty("UsersBalance")]
    public virtual Deposit? Deposit { get; set; }

    [ForeignKey("GameId")]
    [InverseProperty("UsersBalances")]
    public virtual Game? Game { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UsersBalances")]
    public virtual User User { get; set; } = null!;
}
