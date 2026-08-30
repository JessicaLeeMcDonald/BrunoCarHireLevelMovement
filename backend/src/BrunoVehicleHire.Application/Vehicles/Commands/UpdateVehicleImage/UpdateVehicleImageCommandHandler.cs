using BrunoVehicleHire.Application.Vehicles.Dtos;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Domain.Services;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.UpdateVehicleImage;

public sealed class UpdateVehicleImageCommandHandler : IRequestHandler<UpdateVehicleImageCommand, VehicleDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVehicleImageStorage _imageStorage;

    public UpdateVehicleImageCommandHandler(IUnitOfWork unitOfWork, IVehicleImageStorage imageStorage)
    {
        _unitOfWork = unitOfWork;
        _imageStorage = imageStorage;
    }

    public async Task<VehicleDto> Handle(UpdateVehicleImageCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(request.VehicleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Vehicle), request.VehicleId);

        var imageUrl = await _imageStorage.SaveAsync(vehicle.Id, request.ImageContent, request.FileExtension, cancellationToken);

        vehicle.UpdateImage(imageUrl);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return vehicle.ToDto();
    }
}
