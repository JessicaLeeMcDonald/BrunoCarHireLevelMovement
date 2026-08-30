using BrunoVehicleHire.Application.Vehicles.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.UpdateVehicleImage;

public sealed record UpdateVehicleImageCommand(
    Guid VehicleId,
    Stream ImageContent,
    string FileExtension) : IRequest<VehicleDto>;
