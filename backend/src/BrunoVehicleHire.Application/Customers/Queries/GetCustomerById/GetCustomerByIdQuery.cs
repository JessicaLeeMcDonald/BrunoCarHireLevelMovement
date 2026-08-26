using BrunoVehicleHire.Application.Customers.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Queries.GetCustomerById;

public sealed record GetCustomerByIdQuery(Guid Id) : IRequest<CustomerDto>;
