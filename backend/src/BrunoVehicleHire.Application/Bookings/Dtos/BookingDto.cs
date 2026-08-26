namespace BrunoVehicleHire.Application.Bookings.Dtos;

public sealed record BookingDto(
    Guid Id,
    Guid VehicleId,
    Guid CustomerId,
    DateTime StartDate,
    DateTime EndDate,
    decimal TotalPrice,
    string Status,
    DateTime CreatedDate);
