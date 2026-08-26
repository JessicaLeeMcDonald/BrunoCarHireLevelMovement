using BrunoVehicleHire.Domain.ValueObjects;

namespace BrunoVehicleHire.Domain.Services;

public interface IBookingOverlapChecker
{
    Task<bool> HasOverlapAsync(Guid vehicleId, DateRange period, Guid? excludeBookingId = null, CancellationToken ct = default);
}
