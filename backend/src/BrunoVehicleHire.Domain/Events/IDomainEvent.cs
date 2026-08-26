namespace BrunoVehicleHire.Domain.Events;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}
