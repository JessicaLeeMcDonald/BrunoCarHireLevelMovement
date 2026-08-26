using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Enums;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BrunoVehicleHire.Infrastructure.Repositories;

public sealed class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _context;

    public BookingRepository(AppDbContext context)
    {
        _context = context;
    }

    public Task<Booking?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _context.Bookings.FirstOrDefaultAsync(b => b.Id == id, ct);

    public Task<bool> ExistsForCustomerAsync(Guid customerId, CancellationToken ct = default) =>
        _context.Bookings.AnyAsync(b => b.CustomerId == customerId, ct);

    public async Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedAsync(
        int pageNumber, int pageSize, Guid? vehicleId, Guid? customerId, BookingStatus? status,
        DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        var query = _context.Bookings.AsQueryable();

        if (vehicleId.HasValue)
            query = query.Where(b => b.VehicleId == vehicleId.Value);

        if (customerId.HasValue)
            query = query.Where(b => b.CustomerId == customerId.Value);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        if (from.HasValue)
            query = query.Where(b => b.Period.End >= from.Value);

        if (to.HasValue)
            query = query.Where(b => b.Period.Start <= to.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(b => b.CreatedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public void Add(Booking booking) => _context.Bookings.Add(booking);

    public void Remove(Booking booking) => _context.Bookings.Remove(booking);
}
