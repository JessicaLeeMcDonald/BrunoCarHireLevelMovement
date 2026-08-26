using BrunoVehicleHire.Application.Vehicles.Commands.CreateVehicle;
using Swashbuckle.AspNetCore.Filters;

namespace BrunoVehicleHire.Api.Examples;

public sealed class CreateVehicleCommandExample : IExamplesProvider<CreateVehicleCommand>
{
    public CreateVehicleCommand GetExamples() => new(
        RegistrationNumber: "CA123456",
        Make: "Toyota",
        Model: "Corolla",
        Year: 2023,
        DailyRate: 450m);
}
