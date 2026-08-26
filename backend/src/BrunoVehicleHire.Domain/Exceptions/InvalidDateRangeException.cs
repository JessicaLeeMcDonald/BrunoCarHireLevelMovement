namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class InvalidDateRangeException : DomainException
{
    public InvalidDateRangeException(string message) : base(message)
    {
    }
}
