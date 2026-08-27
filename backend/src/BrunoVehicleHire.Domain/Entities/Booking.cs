using BrunoVehicleHire.Domain.Enums;
using BrunoVehicleHire.Domain.Events;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.ValueObjects;

namespace BrunoVehicleHire.Domain.Entities;

public sealed class Booking : BaseEntity
{
    public Guid VehicleId { get; private set; }
    public Guid CustomerId { get; private set; }
    public DateRange Period { get; private set; } = default!;
    public DateTime StartDate => Period.Start;
    public DateTime EndDate => Period.End;
    public decimal TotalPrice { get; private set; }
    public BookingStatus Status { get; private set; }

    private Booking()
    {
    }

    public static Booking Create(Guid vehicleId, Guid customerId, DateRange period, decimal totalPrice)
    {
        if (totalPrice <= 0)
            throw new ArgumentOutOfRangeException(nameof(totalPrice), "Total price must be greater than zero.");

        var booking = new Booking
        {
            VehicleId = vehicleId,
            CustomerId = customerId,
            Period = period,
            TotalPrice = totalPrice,
            Status = BookingStatus.Active
        };

        booking.AddDomainEvent(new BookingCreatedEvent(booking.Id, vehicleId, customerId, period.Start, period.End));
        return booking;
    }

    public bool CanDelete() => Status == BookingStatus.Active && Period.Start > DateTime.UtcNow;

    public void Delete()
    {
        if (!CanDelete())
            throw new PastBookingDeletionException("Only future, active bookings can be deleted.");
    }

    public void Cancel()
    {
        if (Status != BookingStatus.Active)
            throw new InvalidBookingStatusTransitionException($"Cannot cancel a booking with status '{Status}'.");

        Status = BookingStatus.Cancelled;
    }

    public void Complete()
    {
        if (Status != BookingStatus.Active)
            throw new InvalidBookingStatusTransitionException($"Cannot complete a booking with status '{Status}'.");

        Status = BookingStatus.Completed;
    }
}
