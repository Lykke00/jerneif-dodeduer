namespace Service.Helpers;


public static class GamePricing
{
    private static readonly IReadOnlyDictionary<int, decimal> PriceByFieldCount =
        new Dictionary<int, decimal>
        {
            { 5, 20m },
            { 6, 40m },
            { 7, 80m },
            { 8, 160m }
        };

    public static decimal CalculateBoardPrice(int fieldCount)
    {
        if (!PriceByFieldCount.TryGetValue(fieldCount, out var price))
            throw new ArgumentOutOfRangeException(
                nameof(fieldCount),
                "You must select between 5 and 8 numbers.");

        return price;
    }
}