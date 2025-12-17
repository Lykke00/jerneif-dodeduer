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

    public virtual DbSet<BoardPlayedGame> BoardPlayedGames { get; set; }

    public virtual DbSet<BoardRepeatPlan> BoardRepeatPlans { get; set; }

    public virtual DbSet<Deposit> Deposits { get; set; }

    public virtual DbSet<Game> Games { get; set; }

    public virtual DbSet<GameBoard> GameBoards { get; set; }

    public virtual DbSet<GameBoardNumber> GameBoardNumbers { get; set; }

    public virtual DbSet<GamePlay> GamePlays { get; set; }

    public virtual DbSet<GamePlaysNumber> GamePlaysNumbers { get; set; }

    public virtual DbSet<GameWinningNumber> GameWinningNumbers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserLoginToken> UserLoginTokens { get; set; }

    public virtual DbSet<UsersBalance> UsersBalances { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<BoardPlayedGame>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("board_played_games_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.PlayedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Board).WithMany(p => p.BoardPlayedGames)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("board_played_games_board_id_fkey");

            entity.HasOne(d => d.Game).WithMany(p => p.BoardPlayedGames)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("board_played_games_game_id_fkey");

            entity.HasOne(d => d.RepeatPlan).WithMany(p => p.BoardPlayedGames).HasConstraintName("board_played_games_repeat_plan_id_fkey");
        });

        modelBuilder.Entity<BoardRepeatPlan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("board_repeat_plans_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.Active).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(e => e.PlayedCount).HasDefaultValue(0);

            entity.HasOne(d => d.Board).WithMany(p => p.BoardRepeatPlans).HasConstraintName("board_repeat_plans_board_id_fkey");
        });

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
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<GameBoard>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("game_boards_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.User).WithMany(p => p.GameBoards).HasConstraintName("game_boards_user_id_fkey");
        });

        modelBuilder.Entity<GameBoardNumber>(entity =>
        {
            entity.HasKey(e => new { e.BoardId, e.Number }).HasName("game_board_numbers_pkey");

            entity.HasOne(d => d.Board).WithMany(p => p.GameBoardNumbers).HasConstraintName("game_board_numbers_board_id_fkey");
        });

        modelBuilder.Entity<GamePlay>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("game_plays_pkey");

            entity.Property(e => e.Id).HasDefaultValueSql("uuid_generate_v4()");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(d => d.Game).WithMany(p => p.GamePlays).HasConstraintName("game_plays_game_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.GamePlays).HasConstraintName("game_plays_user_id_fkey");
        });

        modelBuilder.Entity<GamePlaysNumber>(entity =>
        {
            entity.HasKey(e => new { e.PlayId, e.Number }).HasName("game_plays_numbers_pkey");

            entity.HasOne(d => d.Play).WithMany(p => p.GamePlaysNumbers).HasConstraintName("game_plays_numbers_play_id_fkey");
        });

        modelBuilder.Entity<GameWinningNumber>(entity =>
        {
            entity.HasKey(e => new { e.GameId, e.Number }).HasName("game_winning_numbers_pkey");

            entity.HasOne(d => d.Game).WithMany(p => p.GameWinningNumbers).HasConstraintName("game_winning_numbers_game_id_fkey");
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

            entity.HasOne(d => d.Play).WithMany(p => p.UsersBalances)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("users_balance_play_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.UsersBalances).HasConstraintName("users_balance_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
