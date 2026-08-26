namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class VehicleUnavailableException : DomainException
{
    public VehicleUnavailableException(string message) : base(message)
    {
    }
}
