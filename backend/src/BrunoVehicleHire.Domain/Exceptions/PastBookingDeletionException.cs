namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class PastBookingDeletionException : DomainException
{
    public PastBookingDeletionException(string message) : base(message)
    {
    }
}
