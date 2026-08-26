using BrunoVehicleHire.Domain.Events;
using MediatR;

namespace BrunoVehicleHire.Application.Common.Events;

public sealed class DomainEventNotification<TDomainEvent> : INotification
    where TDomainEvent : IDomainEvent
{
    public TDomainEvent DomainEvent { get; }

    public DomainEventNotification(TDomainEvent domainEvent)
    {
        DomainEvent = domainEvent;
    }
}
