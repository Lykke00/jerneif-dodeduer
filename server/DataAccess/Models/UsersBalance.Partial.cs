namespace DataAccess.Models;

using System.ComponentModel.DataAnnotations.Schema;

public partial class UsersBalance
{
    public enum BalanceType
    {
        Deposit,
        Play
    }

    [NotMapped]
    public BalanceType BalanceEnum
    {
        get => Type switch
        {
            "deposit" => BalanceType.Deposit,
            "play" => BalanceType.Play,
            _ => throw new InvalidOperationException($"Unknown status '{Type}'")
        };

        set => Type = value switch
        {
            BalanceType.Deposit => "deposit",
            BalanceType.Play => "play",
            _ => throw new InvalidOperationException($"Unknown enum '{value}'")
        };
    }
}