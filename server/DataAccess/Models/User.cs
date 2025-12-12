using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("users")]
public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("email")]
    [StringLength(100)]
    public string Email { get; set; } = null!;

    [Column("first_name")]
    [StringLength(50)]
    public string FirstName { get; set; } = null!;

    [Column("last_name")]
    [StringLength(50)]
    public string LastName { get; set; } = null!;

    [Column("phone")]
    [StringLength(20)]
    public string Phone { get; set; } = null!;

    [Column("admin")]
    public bool Admin { get; set; }

    [Column("active")]
    public bool Active { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [InverseProperty("ApprovedByNavigation")]
    public virtual ICollection<Deposit> DepositApprovedByNavigations { get; set; } = new List<Deposit>();

    [InverseProperty("User")]
    public virtual ICollection<Deposit> DepositUsers { get; set; } = new List<Deposit>();

    [InverseProperty("User")]
    public virtual ICollection<UserLoginToken> UserLoginTokens { get; set; } = new List<UserLoginToken>();
}
