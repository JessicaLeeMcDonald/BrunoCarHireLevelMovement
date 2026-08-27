using BrunoVehicleHire.Application.Customers.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Commands.UpdateCustomer;

public sealed record UpdateCustomerCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string PhoneNumber) : IRequest<CustomerDto>;
