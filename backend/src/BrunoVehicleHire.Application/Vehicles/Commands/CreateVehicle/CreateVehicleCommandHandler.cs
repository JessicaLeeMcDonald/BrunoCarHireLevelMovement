using BrunoVehicleHire.Application.Vehicles.Dtos;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.CreateVehicle;

public sealed class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, VehicleDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateVehicleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<VehicleDto> Handle(CreateVehicleCommand request, CancellationToken cancellationToken)
    {
        if (await _unitOfWork.Vehicles.RegistrationNumberExistsAsync(request.RegistrationNumber, ct: cancellationToken))
            throw new DuplicateEntityException($"A vehicle with registration number '{request.RegistrationNumber}' already exists.");

        var vehicle = Vehicle.Create(request.RegistrationNumber, request.Make, request.Model, request.Year, request.DailyRate);

        _unitOfWork.Vehicles.Add(vehicle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return vehicle.ToDto();
    }
}
