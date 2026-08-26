namespace BrunoVehicleHire.Domain.Events;

public sealed class BookingCreatedEvent : IDomainEvent
{
    public Guid BookingId { get; }
    public Guid VehicleId { get; }
    public Guid CustomerId { get; }
    public DateTime StartDate { get; }
    public DateTime EndDate { get; }
    public DateTime OccurredOn { get; } = DateTime.UtcNow;

    public BookingCreatedEvent(Guid bookingId, Guid vehicleId, Guid customerId, DateTime startDate, DateTime endDate)
    {
        BookingId = bookingId;
        VehicleId = vehicleId;
        CustomerId = customerId;
        StartDate = startDate;
        EndDate = endDate;
    }
}
