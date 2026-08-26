using BrunoVehicleHire.Application.Vehicles.Commands.SoftDeleteVehicle;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using FluentAssertions;
using Moq;

namespace BrunoVehicleHire.Tests.Commands;

public class SoftDeleteVehicleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IVehicleRepository> _vehicleRepository = new();
    private readonly SoftDeleteVehicleCommandHandler _handler;

    public SoftDeleteVehicleCommandHandlerTests()
    {
        _unitOfWork.Setup(u => u.Vehicles).Returns(_vehicleRepository.Object);
        _handler = new SoftDeleteVehicleCommandHandler(_unitOfWork.Object);
    }

    [Fact]
    public async Task Handle_WhenVehicleExists_MarksVehicleAsDeletedAndSaves()
    {
        var vehicle = Vehicle.Create("CA123456", "Toyota", "Corolla", 2023, 450m);
        _vehicleRepository
            .Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);

        await _handler.Handle(new SoftDeleteVehicleCommand(vehicle.Id), CancellationToken.None);

        vehicle.IsDeleted.Should().BeTrue();
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenVehicleDoesNotExist_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _vehicleRepository
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Vehicle?)null);

        var act = () => _handler.Handle(new SoftDeleteVehicleCommand(id), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
