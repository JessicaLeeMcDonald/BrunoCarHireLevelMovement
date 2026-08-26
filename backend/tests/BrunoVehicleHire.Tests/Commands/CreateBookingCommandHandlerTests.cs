using BrunoVehicleHire.Application.Bookings.Commands.CreateBooking;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Domain.Services;
using BrunoVehicleHire.Domain.ValueObjects;
using FluentAssertions;
using Moq;

namespace BrunoVehicleHire.Tests.Commands;

public class CreateBookingCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IVehicleRepository> _vehicleRepository = new();
    private readonly Mock<ICustomerRepository> _customerRepository = new();
    private readonly Mock<IBookingRepository> _bookingRepository = new();
    private readonly Mock<IBookingOverlapChecker> _overlapChecker = new();
    private readonly CreateBookingCommandHandler _handler;

    public CreateBookingCommandHandlerTests()
    {
        _unitOfWork.Setup(u => u.Vehicles).Returns(_vehicleRepository.Object);
        _unitOfWork.Setup(u => u.Customers).Returns(_customerRepository.Object);
        _unitOfWork.Setup(u => u.Bookings).Returns(_bookingRepository.Object);
        _handler = new CreateBookingCommandHandler(_unitOfWork.Object, _overlapChecker.Object);
    }

    [Fact]
    public async Task Handle_WhenNoOverlap_CreatesBookingWithCorrectTotalPrice()
    {
        var vehicle = Vehicle.Create("CA123456", "Toyota", "Corolla", 2023, 450m);
        var customer = Customer.Create("Thabo", "Nkosi", "thabo@example.com", "0821234567");

        _vehicleRepository
            .Setup(r => r.GetByIdIncludingDeletedAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _customerRepository
            .Setup(r => r.GetByIdAsync(customer.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);
        _overlapChecker
            .Setup(c => c.HasOverlapAsync(vehicle.Id, It.IsAny<DateRange>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var start = DateTime.UtcNow.Date.AddDays(1);
        var command = new CreateBookingCommand(vehicle.Id, customer.Id, start, start.AddDays(3));

        var result = await _handler.Handle(command, CancellationToken.None);

        result.TotalPrice.Should().Be(450m * 3);
        result.Status.Should().Be("Active");
        _bookingRepository.Verify(r => r.Add(It.IsAny<Booking>()), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenOverlapExists_ThrowsOverlappingBookingExceptionAndDoesNotSave()
    {
        var vehicle = Vehicle.Create("CA123456", "Toyota", "Corolla", 2023, 450m);
        var customer = Customer.Create("Thabo", "Nkosi", "thabo@example.com", "0821234567");

        _vehicleRepository
            .Setup(r => r.GetByIdIncludingDeletedAsync(vehicle.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(vehicle);
        _customerRepository
            .Setup(r => r.GetByIdAsync(customer.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);
        _overlapChecker
            .Setup(c => c.HasOverlapAsync(vehicle.Id, It.IsAny<DateRange>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var start = DateTime.UtcNow.Date.AddDays(1);
        var command = new CreateBookingCommand(vehicle.Id, customer.Id, start, start.AddDays(2));

        var act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<OverlappingBookingException>();
        _bookingRepository.Verify(r => r.Add(It.IsAny<Booking>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
