namespace BrunoVehicleHire.Domain.Repositories;

public interface IUnitOfWork
{
    IVehicleRepository Vehicles { get; }
    ICustomerRepository Customers { get; }
    IBookingRepository Bookings { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);

    /// <summary>
    /// Runs <paramref name="action"/> inside a database transaction while holding an exclusive,
    /// transaction-scoped lock on <paramref name="lockKey"/>, so that concurrent calls using the same
    /// key are serialized. Used where a business invariant (e.g. no overlapping bookings for a vehicle)
    /// can't be enforced by a single-row DB constraint.
    /// </summary>
    Task<TResult> ExecuteExclusiveAsync<TResult>(
        string lockKey, Func<CancellationToken, Task<TResult>> action, CancellationToken ct = default);
}
