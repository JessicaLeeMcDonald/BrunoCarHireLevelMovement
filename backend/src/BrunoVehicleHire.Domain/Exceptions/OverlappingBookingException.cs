namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class OverlappingBookingException : DomainException
{
    public OverlappingBookingException(string message) : base(message)
    {
    }
}
