using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Models;

public partial class Deposit
{
    public enum DepositStatus
    {
        Pending,
        Approved,
        Declined
    }

    [NotMapped]
    public DepositStatus StatusEnum
    {
        get => Status switch
        {
            "pending" => DepositStatus.Pending,
            "approved" => DepositStatus.Approved,
            "declined" => DepositStatus.Declined,
            _ => throw new InvalidOperationException($"Unknown status '{Status}'")
        };

        set => Status = value switch
        {
            DepositStatus.Pending => "pending",
            DepositStatus.Approved => "approved",
            DepositStatus.Declined => "declined",
            _ => throw new InvalidOperationException($"Unknown enum '{value}'")
        };
    }
}