using MediatR;

namespace BrunoVehicleHire.Application.Customers.Commands.DeleteCustomer;

public sealed record DeleteCustomerCommand(Guid Id) : IRequest;
