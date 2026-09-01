using BrunoVehicleHire.Application.Vehicles.Dtos;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Domain.Services;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.DeleteVehicleImage;

public sealed class DeleteVehicleImageCommandHandler : IRequestHandler<DeleteVehicleImageCommand, VehicleDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVehicleImageStorage _imageStorage;

    public DeleteVehicleImageCommandHandler(IUnitOfWork unitOfWork, IVehicleImageStorage imageStorage)
    {
        _unitOfWork = unitOfWork;
        _imageStorage = imageStorage;
    }

    public async Task<VehicleDto> Handle(DeleteVehicleImageCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(request.VehicleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Vehicle), request.VehicleId);

        await _imageStorage.DeleteAsync(vehicle.ImageUrl, cancellationToken);
        vehicle.UpdateImage(null);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return vehicle.ToDto();
    }
}
