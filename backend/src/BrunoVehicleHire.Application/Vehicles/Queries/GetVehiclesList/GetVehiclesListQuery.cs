using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Application.Vehicles.Dtos;
using MediatR;

namespace BrunoVehicleHire.Application.Vehicles.Queries.GetVehiclesList;

public sealed record GetVehiclesListQuery(
    int PageNumber,
    int PageSize,
    string? Make,
    string? Model,
    bool? AvailableOnly,
    bool IncludeDeleted = false) : IRequest<PagedResult<VehicleDto>>;
