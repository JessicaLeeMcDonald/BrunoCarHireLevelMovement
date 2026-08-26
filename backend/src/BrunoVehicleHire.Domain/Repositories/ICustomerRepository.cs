using BrunoVehicleHire.Domain.Entities;

namespace BrunoVehicleHire.Domain.Repositories;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null, CancellationToken ct = default);

    Task<(IReadOnlyList<Customer> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, string? search, CancellationToken ct = default);

    void Add(Customer customer);

    void Remove(Customer customer);
}
