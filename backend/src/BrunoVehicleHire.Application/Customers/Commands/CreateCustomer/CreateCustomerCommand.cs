using BrunoVehicleHire.Application.Customers.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Commands.CreateCustomer;

public sealed record CreateCustomerCommand(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber) : IRequest<CustomerDto>;
