using BrunoVehicleHire.Application.Customers.Dtos;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Commands.UpdateCustomer;

public sealed class UpdateCustomerCommandHandler : IRequestHandler<UpdateCustomerCommand, CustomerDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCustomerCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CustomerDto> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Customer), request.Id);

        customer.UpdateDetails(request.FirstName, request.LastName, request.PhoneNumber);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return customer.ToDto();
    }
}
