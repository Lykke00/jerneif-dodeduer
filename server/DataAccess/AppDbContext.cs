using System;
using System.Collections.Generic;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Deposit> Deposits { get; set; }

    public virtual DbSet<Game> Games { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserLoginToken> UserLoginTokens { get; set; }

    public virtual DbSet<UsersBalance> UsersBalances { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<Deposit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("deposits_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Status).HasDefaultValueSql("'pending'::text");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.DepositApprovedByNavigations)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("deposits_approved_by_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.DepositUsers).HasConstraintName("deposits_user_id_fkey");
        });

        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("games_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Active).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Active).HasDefaultValue(true);
            entity.Property(e => e.Admin).HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<UserLoginToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_login_tokens_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.User).WithMany(p => p.UserLoginTokens).HasConstraintName("user_login_tokens_user_id_fkey");
        });

        modelBuilder.Entity<UsersBalance>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_balance_pkey");

            entity.HasIndex(e => e.DepositId, "idx_users_balance_deposit_id")
                .IsUnique()
                .HasFilter("(deposit_id IS NOT NULL)");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.Type).HasDefaultValueSql("'deposit'::text");

            entity.HasOne(d => d.Deposit).WithOne(p => p.UsersBalance)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("users_balance_deposit_id_fkey");

            entity.HasOne(d => d.Game).WithMany(p => p.UsersBalances)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("users_balance_game_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.UsersBalances).HasConstraintName("users_balance_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
