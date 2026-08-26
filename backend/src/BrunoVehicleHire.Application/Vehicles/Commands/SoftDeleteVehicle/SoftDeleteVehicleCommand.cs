using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Commands.SoftDeleteVehicle;

public sealed record SoftDeleteVehicleCommand(Guid Id) : IRequest;
