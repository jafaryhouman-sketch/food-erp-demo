namespace Haseb.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string Unit { get; set; } = "عدد";
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}
