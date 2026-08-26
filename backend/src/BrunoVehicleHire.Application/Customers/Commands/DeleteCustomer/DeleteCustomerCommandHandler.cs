using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Customers.Commands.DeleteCustomer;

public sealed class DeleteCustomerCommandHandler : IRequestHandler<DeleteCustomerCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCustomerCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Customer), request.Id);

        if (await _unitOfWork.Bookings.ExistsForCustomerAsync(request.Id, cancellationToken))
            throw new CustomerHasBookingsException("Cannot delete a customer that has existing bookings.");

        _unitOfWork.Customers.Remove(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
