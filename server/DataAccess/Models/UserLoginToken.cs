using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Models;

[Table("user_login_tokens")]
public partial class UserLoginToken
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("token_hash")]
    public string TokenHash { get; set; } = null!;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("used_at")]
    public DateTime? UsedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("requested_ip")]
    public string? RequestedIp { get; set; }

    [Column("requested_user_agent")]
    public string? RequestedUserAgent { get; set; }

    [Column("consumed_ip")]
    public string? ConsumedIp { get; set; }

    [Column("consumed_user_agent")]
    public string? ConsumedUserAgent { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserLoginTokens")]
    public virtual User User { get; set; } = null!;
}
