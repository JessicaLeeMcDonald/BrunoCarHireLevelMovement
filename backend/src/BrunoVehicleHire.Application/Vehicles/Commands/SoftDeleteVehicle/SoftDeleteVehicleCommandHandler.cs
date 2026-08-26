using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.SoftDeleteVehicle;

public sealed class SoftDeleteVehicleCommandHandler : IRequestHandler<SoftDeleteVehicleCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public SoftDeleteVehicleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SoftDeleteVehicleCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Vehicle), request.Id);

        vehicle.SoftDelete();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
