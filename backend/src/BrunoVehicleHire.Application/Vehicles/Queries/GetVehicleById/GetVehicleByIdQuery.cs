using BrunoVehicleHire.Application.Vehicles.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Queries.GetVehicleById;

public sealed record GetVehicleByIdQuery(Guid Id) : IRequest<VehicleDto>;
