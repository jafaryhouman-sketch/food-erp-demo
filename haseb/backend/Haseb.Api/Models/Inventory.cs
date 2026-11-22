namespace Haseb.Api.Models;

public class Inventory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal MinimumQuantity { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Product? Product { get; set; }
    public bool IsLowStock => Quantity <= MinimumQuantity;
}
