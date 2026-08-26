using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.DeleteBooking;

public sealed class DeleteBookingCommandHandler : IRequestHandler<DeleteBookingCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Booking), request.Id);

        booking.Delete();

        _unitOfWork.Bookings.Remove(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
