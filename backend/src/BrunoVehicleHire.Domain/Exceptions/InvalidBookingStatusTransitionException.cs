namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class InvalidBookingStatusTransitionException : DomainException
{
    public InvalidBookingStatusTransitionException(string message) : base(message)
    {
    }
}
