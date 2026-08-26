using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Application.Customers.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Queries.GetCustomersList;

public sealed record GetCustomersListQuery(
    int PageNumber,
    int PageSize,
    string? Search) : IRequest<PagedResult<CustomerDto>>;
