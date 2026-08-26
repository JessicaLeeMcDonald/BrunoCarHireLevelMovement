using BrunoVehicleHire.Domain.Enums;
using BrunoVehicleHire.Domain.Services;
using BrunoVehicleHire.Domain.ValueObjects;
using BrunoVehicleHire.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BrunoVehicleHire.Infrastructure.Services;

public sealed class BookingOverlapChecker : IBookingOverlapChecker
{
    private readonly AppDbContext _context;

    public BookingOverlapChecker(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasOverlapAsync(Guid vehicleId, DateRange period, Guid? excludeBookingId = null, CancellationToken ct = default)
    {
        var query = _context.Bookings.Where(b =>
            b.VehicleId == vehicleId &&
            b.Status == BookingStatus.Active &&
            b.Period.Start < period.End &&
            period.Start < b.Period.End);

        if (excludeBookingId.HasValue)
            query = query.Where(b => b.Id != excludeBookingId.Value);

        return await query.AnyAsync(ct);
    }
}
