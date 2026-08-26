using BrunoVehicleHire.Domain.Entities;

namespace BrunoVehicleHire.Application.Bookings.Dtos;

public static class BookingMappingExtensions
{
    public static BookingDto ToDto(this Booking booking) => new(
        booking.Id,
        booking.VehicleId,
        booking.CustomerId,
        booking.StartDate,
        booking.EndDate,
        booking.TotalPrice,
        booking.Status.ToString(),
        booking.CreatedDate);
}
