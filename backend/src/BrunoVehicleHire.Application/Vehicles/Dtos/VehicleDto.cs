namespace BrunoVehicleHire.Application.Vehicles.Dtos;

public sealed record VehicleDto(
    Guid Id,
    string RegistrationNumber,
    string Make,
    string Model,
    int Year,
    decimal DailyRate,
    bool IsDeleted,
    DateTime CreatedDate);
