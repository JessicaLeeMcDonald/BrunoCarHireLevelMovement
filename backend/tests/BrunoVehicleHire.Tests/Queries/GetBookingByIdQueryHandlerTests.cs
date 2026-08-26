using BrunoVehicleHire.Application.Bookings.Queries.GetBookingById;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Domain.ValueObjects;
using FluentAssertions;
using Moq;

namespace BrunoVehicleHire.Tests.Queries;

public class GetBookingByIdQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IBookingRepository> _bookingRepository = new();
    private readonly GetBookingByIdQueryHandler _handler;

    public GetBookingByIdQueryHandlerTests()
    {
        _unitOfWork.Setup(u => u.Bookings).Returns(_bookingRepository.Object);
        _handler = new GetBookingByIdQueryHandler(_unitOfWork.Object);
    }

    [Fact]
    public async Task Handle_WhenBookingExists_ReturnsMappedDto()
    {
        var start = DateTime.UtcNow.Date.AddDays(1);
        var booking = Booking.Create(Guid.NewGuid(), Guid.NewGuid(), new DateRange(start, start.AddDays(2)), 900m);

        _bookingRepository
            .Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);

        var result = await _handler.Handle(new GetBookingByIdQuery(booking.Id), CancellationToken.None);

        result.Id.Should().Be(booking.Id);
        result.TotalPrice.Should().Be(900m);
        result.Status.Should().Be("Active");
    }

    [Fact]
    public async Task Handle_WhenBookingDoesNotExist_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _bookingRepository
            .Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Booking?)null);

        var act = () => _handler.Handle(new GetBookingByIdQuery(id), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
