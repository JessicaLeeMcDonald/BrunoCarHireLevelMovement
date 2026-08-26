using BrunoVehicleHire.Application.Bookings.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.CreateBooking;

public sealed record CreateBookingCommand(
    Guid VehicleId,
    Guid CustomerId,
    DateTime StartDate,
    DateTime EndDate) : IRequest<BookingDto>;
