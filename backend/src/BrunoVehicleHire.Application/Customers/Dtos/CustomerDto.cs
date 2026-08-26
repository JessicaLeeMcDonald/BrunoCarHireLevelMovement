namespace BrunoVehicleHire.Application.Customers.Dtos;

public sealed record CustomerDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateTime CreatedDate);
