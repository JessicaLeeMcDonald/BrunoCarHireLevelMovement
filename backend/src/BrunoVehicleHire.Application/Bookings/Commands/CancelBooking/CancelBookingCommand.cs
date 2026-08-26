using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.CancelBooking;

public sealed record CancelBookingCommand(Guid Id) : IRequest;
