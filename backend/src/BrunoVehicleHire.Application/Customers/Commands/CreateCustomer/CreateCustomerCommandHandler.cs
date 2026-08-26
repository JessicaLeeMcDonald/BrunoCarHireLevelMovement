using BrunoVehicleHire.Application.Customers.Dtos;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Commands.CreateCustomer;

public sealed class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, CustomerDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateCustomerCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CustomerDto> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        if (await _unitOfWork.Customers.EmailExistsAsync(request.Email, ct: cancellationToken))
            throw new DuplicateEntityException($"A customer with email '{request.Email}' already exists.");

        var customer = Customer.Create(request.FirstName, request.LastName, request.Email, request.PhoneNumber);

        _unitOfWork.Customers.Add(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return customer.ToDto();
    }
}
