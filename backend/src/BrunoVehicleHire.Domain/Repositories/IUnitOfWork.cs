namespace BrunoVehicleHire.Domain.Repositories;

public interface IUnitOfWork
{
    IVehicleRepository Vehicles { get; }
    ICustomerRepository Customers { get; }
    IBookingRepository Bookings { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
