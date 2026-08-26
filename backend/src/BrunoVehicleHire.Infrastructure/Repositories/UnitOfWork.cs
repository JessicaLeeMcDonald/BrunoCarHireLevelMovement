using BrunoVehicleHire.Application.Common.Events;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Infrastructure.Persistence;
using MediatR;

namespace BrunoVehicleHire.Infrastructure.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    private readonly IPublisher _publisher;

    public UnitOfWork(
        AppDbContext context,
        IPublisher publisher,
        IVehicleRepository vehicles,
        ICustomerRepository customers,
        IBookingRepository bookings)
    {
        _context = context;
        _publisher = publisher;
        Vehicles = vehicles;
        Customers = customers;
        Bookings = bookings;
    }

    public IVehicleRepository Vehicles { get; }
    public ICustomerRepository Customers { get; }
    public IBookingRepository Bookings { get; }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var entitiesWithEvents = _context.ChangeTracker.Entries<BaseEntity>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Count > 0)
            .ToList();

        var domainEvents = entitiesWithEvents.SelectMany(e => e.DomainEvents).ToList();
        entitiesWithEvents.ForEach(e => e.ClearDomainEvents());

        var result = await _context.SaveChangesAsync(ct);

        foreach (var domainEvent in domainEvents)
        {
            var notificationType = typeof(DomainEventNotification<>).MakeGenericType(domainEvent.GetType());
            var notification = (INotification)Activator.CreateInstance(notificationType, domainEvent)!;
            await _publisher.Publish(notification, ct);
        }

        return result;
    }
}
