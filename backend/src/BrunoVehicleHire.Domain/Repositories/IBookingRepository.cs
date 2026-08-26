using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Enums;

namespace BrunoVehicleHire.Domain.Repositories;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<bool> ExistsForCustomerAsync(Guid customerId, CancellationToken ct = default);

    Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, Guid? vehicleId, Guid? customerId, BookingStatus? status,
        DateTime? from, DateTime? to, CancellationToken ct = default);

    void Add(Booking booking);

    void Remove(Booking booking);
}
