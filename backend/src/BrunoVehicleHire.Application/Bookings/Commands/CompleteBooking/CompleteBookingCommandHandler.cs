using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.CompleteBooking;

public sealed class CompleteBookingCommandHandler : IRequestHandler<CompleteBookingCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public CompleteBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CompleteBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Booking), request.Id);

        booking.Complete();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
