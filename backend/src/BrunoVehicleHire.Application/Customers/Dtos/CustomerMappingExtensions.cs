using BrunoVehicleHire.Domain.Entities;

namespace BrunoVehicleHire.Application.Customers.Dtos;

public static class CustomerMappingExtensions
{
    public static CustomerDto ToDto(this Customer customer) => new(
        customer.Id,
        customer.FirstName,
        customer.LastName,
        customer.Email,
        customer.PhoneNumber,
        customer.CreatedDate);
}
