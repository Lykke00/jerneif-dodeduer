using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("deposits")]
[Index("ApprovedBy", Name = "idx_deposits_approved_by")]
[Index("Status", Name = "idx_deposits_status")]
[Index("Status", "CreatedAt", Name = "idx_deposits_status_created_at")]
[Index("UserId", Name = "idx_deposits_user_id")]
public partial class Deposit
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("amount")]
    [Precision(12, 2)]
    public decimal Amount { get; set; }

    [Column("payment_id")]
    [StringLength(100)]
    public string? PaymentId { get; set; }

    [Column("payment_picture")]
    [StringLength(150)]
    public string? PaymentPicture { get; set; }

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("approved_by")]
    public Guid? ApprovedBy { get; set; }

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ApprovedBy")]
    [InverseProperty("DepositApprovedByNavigations")]
    public virtual User? ApprovedByNavigation { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("DepositUsers")]
    public virtual User User { get; set; } = null!;

    [InverseProperty("Deposit")]
    public virtual UsersBalance? UsersBalance { get; set; }
}
