using BrunoVehicleHire.Application.Customers.Commands.CreateCustomer;
using Swashbuckle.AspNetCore.Filters;

namespace BrunoVehicleHire.Api.Examples;

public sealed class CreateCustomerCommandExample : IExamplesProvider<CreateCustomerCommand>
{
    public CreateCustomerCommand GetExamples() => new(
        FirstName: "Thabo",
        LastName: "Nkosi",
        Email: "thabo.nkosi@example.com",
        PhoneNumber: "0821234567");
}
