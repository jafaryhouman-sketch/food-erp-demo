using Haseb.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Haseb.Api.Data;

public class HasebDbContext(DbContextOptions<HasebDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.Code).IsUnique();
            entity.Property(p => p.Code).HasMaxLength(50).IsRequired();
            entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Category).HasMaxLength(100);
            entity.Property(p => p.Unit).HasMaxLength(30);
            entity.Property(p => p.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.HasIndex(i => i.ProductId).IsUnique();
            entity.Property(i => i.Quantity).HasPrecision(18, 3);
            entity.Property(i => i.MinimumQuantity).HasPrecision(18, 3);
            entity.HasOne(i => i.Product).WithOne()
                .HasForeignKey<Inventory>(i => i.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Type).HasMaxLength(20).IsRequired();
            entity.Property(m => m.Quantity).HasPrecision(18, 3);
            entity.Property(m => m.BalanceAfter).HasPrecision(18, 3);
            entity.Property(m => m.Description).HasMaxLength(500);
            entity.HasOne(m => m.Product).WithMany()
                .HasForeignKey(m => m.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(m => new { m.ProductId, m.CreatedAt });
        });
    }
}
