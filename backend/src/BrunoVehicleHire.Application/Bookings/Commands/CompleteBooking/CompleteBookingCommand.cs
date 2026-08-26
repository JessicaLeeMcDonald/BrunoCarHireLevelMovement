using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.CompleteBooking;

public sealed record CompleteBookingCommand(Guid Id) : IRequest;
