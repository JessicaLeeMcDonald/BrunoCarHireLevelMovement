namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class CustomerHasBookingsException : DomainException
{
    public CustomerHasBookingsException(string message) : base(message)
    {
    }
}
