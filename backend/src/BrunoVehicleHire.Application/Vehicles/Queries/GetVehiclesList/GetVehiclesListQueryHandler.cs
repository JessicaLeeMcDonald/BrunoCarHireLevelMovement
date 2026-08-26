using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Application.Vehicles.Dtos;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Queries.GetVehiclesList;

public sealed class GetVehiclesListQueryHandler : IRequestHandler<GetVehiclesListQuery, PagedResult<VehicleDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetVehiclesListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<VehicleDto>> Handle(GetVehiclesListQuery request, CancellationToken cancellationToken)
    {
        var (pageNumber, pageSize) = Pagination.Normalize(request.PageNumber, request.PageSize);

        var (items, totalCount) = await _unitOfWork.Vehicles.GetPagedAsync(
            pageNumber, pageSize, request.Make, request.Model, request.AvailableOnly, cancellationToken);

        return new PagedResult<VehicleDto>(items.Select(v => v.ToDto()).ToList(), pageNumber, pageSize, totalCount);
    }
}
