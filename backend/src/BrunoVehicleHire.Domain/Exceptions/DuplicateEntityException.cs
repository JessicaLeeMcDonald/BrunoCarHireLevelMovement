namespace BrunoVehicleHire.Domain.Exceptions;

public sealed class DuplicateEntityException : DomainException
{
    public DuplicateEntityException(string message) : base(message)
    {
    }
}
