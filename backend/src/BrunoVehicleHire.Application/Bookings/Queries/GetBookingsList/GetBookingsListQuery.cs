using BrunoVehicleHire.Application.Bookings.Dtos;
using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Domain.Enums;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Queries.GetBookingsList;

public sealed record GetBookingsListQuery(
    int PageNumber,
    int PageSize,
    Guid? VehicleId,
    Guid? CustomerId,
    BookingStatus? Status,
    DateTime? From,
    DateTime? To) : IRequest<PagedResult<BookingDto>>;
