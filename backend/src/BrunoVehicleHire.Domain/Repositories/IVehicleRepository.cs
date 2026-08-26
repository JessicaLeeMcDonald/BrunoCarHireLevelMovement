using BrunoVehicleHire.Domain.Entities;

namespace BrunoVehicleHire.Domain.Repositories;

public interface IVehicleRepository
{
    Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<Vehicle?> GetByIdIncludingDeletedAsync(Guid id, CancellationToken ct = default);

    Task<bool> RegistrationNumberExistsAsync(string registrationNumber, Guid? excludeId = null, CancellationToken ct = default);

    Task<(IReadOnlyList<Vehicle> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, string? make, string? model, bool? availableOnly, CancellationToken ct = default);

    void Add(Vehicle vehicle);
}
