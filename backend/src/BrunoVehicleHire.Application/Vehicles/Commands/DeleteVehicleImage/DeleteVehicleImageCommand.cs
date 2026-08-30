using BrunoVehicleHire.Application.Vehicles.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.DeleteVehicleImage;

public sealed record DeleteVehicleImageCommand(Guid VehicleId) : IRequest<VehicleDto>;
