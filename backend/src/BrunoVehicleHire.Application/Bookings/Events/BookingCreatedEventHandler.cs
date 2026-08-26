using BrunoVehicleHire.Application.Common.Events;
using BrunoVehicleHire.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BrunoVehicleHire.Application.Bookings.Events;

public sealed class BookingCreatedEventHandler : INotificationHandler<DomainEventNotification<BookingCreatedEvent>>
{
    private readonly ILogger<BookingCreatedEventHandler> _logger;

    public BookingCreatedEventHandler(ILogger<BookingCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(DomainEventNotification<BookingCreatedEvent> notification, CancellationToken cancellationToken)
    {
        var domainEvent = notification.DomainEvent;

        _logger.LogInformation(
            "Booking {BookingId} created for vehicle {VehicleId} from {StartDate:d} to {EndDate:d}.",
            domainEvent.BookingId, domainEvent.VehicleId, domainEvent.StartDate, domainEvent.EndDate);

        return Task.CompletedTask;
    }
}
