using BrunoVehicleHire.Application.Vehicles.Queries.GetVehiclesList;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Repositories;
using FluentAssertions;
using Moq;

namespace BrunoVehicleHire.Tests.Queries;

public class GetVehiclesListQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IVehicleRepository> _vehicleRepository = new();
    private readonly GetVehiclesListQueryHandler _handler;

    public GetVehiclesListQueryHandlerTests()
    {
        _unitOfWork.Setup(u => u.Vehicles).Returns(_vehicleRepository.Object);
        _handler = new GetVehiclesListQueryHandler(_unitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPagedResultMappedFromRepository()
    {
        var vehicles = new List<Vehicle>
        {
            Vehicle.Create("CA123456", "Toyota", "Corolla", 2023, 450m),
            Vehicle.Create("CA654321", "Volkswagen", "Polo", 2022, 400m),
        };

        _vehicleRepository
            .Setup(r => r.GetPagedAsync(1, 20, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((vehicles, vehicles.Count));

        var result = await _handler.Handle(new GetVehiclesListQuery(1, 20, null, null, null), CancellationToken.None);

        result.TotalCount.Should().Be(2);
        result.Items.Should().HaveCount(2);
        result.Items.Select(v => v.RegistrationNumber).Should().Contain(new[] { "CA123456", "CA654321" });
    }

    [Fact]
    public async Task Handle_NormalizesOutOfRangePagination()
    {
        _vehicleRepository
            .Setup(r => r.GetPagedAsync(1, 20, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<Vehicle>(), 0));

        var result = await _handler.Handle(new GetVehiclesListQuery(0, 0, null, null, null), CancellationToken.None);

        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(20);
    }
}
