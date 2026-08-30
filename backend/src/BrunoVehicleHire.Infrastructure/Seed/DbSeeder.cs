using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.ValueObjects;
using BrunoVehicleHire.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BrunoVehicleHire.Infrastructure.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Vehicles.IgnoreQueryFilters().AnyAsync())
            return;

        var vehicles = new[]
        {
            Vehicle.Create("CA123456", "Toyota", "Corolla", 2022, 450m),
            Vehicle.Create("CA654321", "Volkswagen", "Polo", 2021, 400m),
            Vehicle.Create("CA789012", "Ford", "Ranger", 2023, 850m),
        };
        vehicles[0].UpdateImage("/vehicle-images/seed/sedan.svg");
        vehicles[1].UpdateImage("/vehicle-images/seed/hatchback.svg");
        vehicles[2].UpdateImage("/vehicle-images/seed/pickup.svg");
        context.Vehicles.AddRange(vehicles);

        var customers = new[]
        {
            Customer.Create("Thabo", "Nkosi", "thabo.nkosi@example.com", "0821234567"),
            Customer.Create("Anika", "van der Merwe", "anika.vdm@example.com", "0827654321"),
        };
        context.Customers.AddRange(customers);

        await context.SaveChangesAsync();

        var today = DateTime.UtcNow.Date;

        var upcomingBooking = Booking.Create(
            vehicles[0].Id, customers[0].Id,
            new DateRange(today.AddDays(3), today.AddDays(6)),
            vehicles[0].DailyRate * 3);

        var pastBooking = Booking.Create(
            vehicles[1].Id, customers[1].Id,
            new DateRange(today.AddDays(-10), today.AddDays(-7)),
            vehicles[1].DailyRate * 3);
        pastBooking.Complete();

        context.Bookings.AddRange(upcomingBooking, pastBooking);

        await context.SaveChangesAsync();
    }
}
