using BrunoVehicleHire.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BrunoVehicleHire.Infrastructure.Persistence.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");
        builder.HasKey(b => b.Id);

        builder.OwnsOne(b => b.Period, period =>
        {
            period.Property(p => p.Start).HasColumnName("StartDate").IsRequired();
            period.Property(p => p.End).HasColumnName("EndDate").IsRequired();
        });

        builder.Navigation(b => b.Period).IsRequired();

        builder.Property(b => b.TotalPrice).HasColumnType("decimal(10,2)");
        builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne<Vehicle>().WithMany().HasForeignKey(b => b.VehicleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Customer>().WithMany().HasForeignKey(b => b.CustomerId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(b => new { b.VehicleId, b.Status }).HasDatabaseName("IX_Bookings_VehicleId_Status");
        builder.HasIndex(b => b.CustomerId).HasDatabaseName("IX_Bookings_CustomerId");
    }
}
