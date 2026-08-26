using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Application.Customers.Dtos;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Queries.GetCustomersList;

public sealed class GetCustomersListQueryHandler : IRequestHandler<GetCustomersListQuery, PagedResult<CustomerDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCustomersListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<CustomerDto>> Handle(GetCustomersListQuery request, CancellationToken cancellationToken)
    {
        var (pageNumber, pageSize) = Pagination.Normalize(request.PageNumber, request.PageSize);

        var (items, totalCount) = await _unitOfWork.Customers.GetPagedAsync(
            pageNumber, pageSize, request.Search, cancellationToken);

        return new PagedResult<CustomerDto>(items.Select(c => c.ToDto()).ToList(), pageNumber, pageSize, totalCount);
    }
}
