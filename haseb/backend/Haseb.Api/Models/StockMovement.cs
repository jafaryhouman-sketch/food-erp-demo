namespace Haseb.Api.Models;

public class StockMovement
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Type { get; set; } = "";
    public decimal Quantity { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Product? Product { get; set; }
}
