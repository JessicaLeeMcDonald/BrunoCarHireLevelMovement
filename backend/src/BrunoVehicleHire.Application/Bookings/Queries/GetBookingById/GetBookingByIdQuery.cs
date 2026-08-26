using BrunoVehicleHire.Application.Bookings.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Queries.GetBookingById;

public sealed record GetBookingByIdQuery(Guid Id) : IRequest<BookingDto>;
