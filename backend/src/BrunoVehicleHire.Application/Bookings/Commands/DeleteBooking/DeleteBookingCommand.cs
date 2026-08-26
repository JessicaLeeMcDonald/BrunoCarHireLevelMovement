using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.DeleteBooking;

public sealed record DeleteBookingCommand(Guid Id) : IRequest;
