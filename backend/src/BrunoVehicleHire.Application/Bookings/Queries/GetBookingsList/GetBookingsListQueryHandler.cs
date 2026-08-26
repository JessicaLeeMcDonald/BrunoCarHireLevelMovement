using BrunoVehicleHire.Application.Bookings.Dtos;
using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Queries.GetBookingsList;

public sealed class GetBookingsListQueryHandler : IRequestHandler<GetBookingsListQuery, PagedResult<BookingDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetBookingsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<BookingDto>> Handle(GetBookingsListQuery request, CancellationToken cancellationToken)
    {
        var (pageNumber, pageSize) = Pagination.Normalize(request.PageNumber, request.PageSize);

        var (items, totalCount) = await _unitOfWork.Bookings.GetPagedAsync(
            pageNumber, pageSize, request.VehicleId, request.CustomerId, request.Status,
            request.From, request.To, cancellationToken);

        return new PagedResult<BookingDto>(items.Select(b => b.ToDto()).ToList(), pageNumber, pageSize, totalCount);
    }
}
