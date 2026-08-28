using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Enums;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BrunoVehicleHire.Infrastructure.Repositories;

public sealed class VehicleRepository : IVehicleRepository
{
    private readonly AppDbContext _context;

    public VehicleRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);

    public Task<Vehicle?> GetByIdIncludingDeletedAsync(Guid id, CancellationToken ct = default) =>
        _context.Vehicles.IgnoreQueryFilters().FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<bool> RegistrationNumberExistsAsync(string registrationNumber, Guid? excludeId = null, CancellationToken ct = default)
    {
        var query = _context.Vehicles.IgnoreQueryFilters().Where(v => v.RegistrationNumber == registrationNumber);

        if (excludeId.HasValue)
            query = query.Where(v => v.Id != excludeId.Value);

        return await query.AnyAsync(ct);
    }

    public async Task<(IReadOnlyList<Vehicle> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, string? make, string? model, bool? availableOnly, bool includeDeleted = false,
        DateTime? availableFrom = null, DateTime? availableTo = null, CancellationToken ct = default)
    {
        var query = includeDeleted ? _context.Vehicles.IgnoreQueryFilters().AsQueryable() : _context.Vehicles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(make))
            query = query.Where(v => v.Make.Contains(make));

        if (!string.IsNullOrWhiteSpace(model))
            query = query.Where(v => v.Model.Contains(model));

        if (availableOnly == true)
        {
            var now = DateTime.UtcNow;
            query = query.Where(v => !_context.Bookings.Any(b =>
                b.VehicleId == v.Id &&
                b.Status == BookingStatus.Active &&
                b.Period.Start <= now && b.Period.End >= now));
        }

        if (availableFrom.HasValue && availableTo.HasValue)
        {
            var from = availableFrom.Value;
            var to = availableTo.Value;
            query = query.Where(v => !_context.Bookings.Any(b =>
                b.VehicleId == v.Id &&
                b.Status == BookingStatus.Active &&
                b.Period.Start < to && from < b.Period.End));
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(v => v.RegistrationNumber)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public void Add(Vehicle vehicle) => _context.Vehicles.Add(vehicle);
}
