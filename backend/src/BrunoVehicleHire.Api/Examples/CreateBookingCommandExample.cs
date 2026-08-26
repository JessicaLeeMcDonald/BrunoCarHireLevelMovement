using BrunoVehicleHire.Application.Bookings.Commands.CreateBooking;
using Swashbuckle.AspNetCore.Filters;

namespace BrunoVehicleHire.Api.Examples;

public sealed class CreateBookingCommandExample : IExamplesProvider<CreateBookingCommand>
{
    public CreateBookingCommand GetExamples() => new(
        VehicleId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        CustomerId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        StartDate: DateTime.UtcNow.Date.AddDays(1),
        EndDate: DateTime.UtcNow.Date.AddDays(4));
}
