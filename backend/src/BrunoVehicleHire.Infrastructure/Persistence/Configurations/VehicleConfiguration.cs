using BrunoVehicleHire.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BrunoVehicleHire.Infrastructure.Persistence.Configurations;

public sealed class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.RegistrationNumber).IsRequired().HasMaxLength(20);
        builder.Property(v => v.Make).IsRequired().HasMaxLength(50);
        builder.Property(v => v.Model).IsRequired().HasMaxLength(50);
        builder.Property(v => v.DailyRate).HasColumnType("decimal(10,2)");
        builder.Property(v => v.ImageUrl).HasMaxLength(500);

        builder.HasIndex(v => v.RegistrationNumber).IsUnique().HasDatabaseName("IX_Vehicles_RegistrationNumber");

        builder.HasQueryFilter(v => !v.IsDeleted);
    }
}
