using BrunoVehicleHire.Domain.Entities;

namespace BrunoVehicleHire.Application.Vehicles.Dtos;

public static class VehicleMappingExtensions
{
    public static VehicleDto ToDto(this Vehicle vehicle) => new(
        vehicle.Id,
        vehicle.RegistrationNumber,
        vehicle.Make,
        vehicle.Model,
        vehicle.Year,
        vehicle.DailyRate,
        vehicle.IsDeleted,
        vehicle.CreatedDate);
}
