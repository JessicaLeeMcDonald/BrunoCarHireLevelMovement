using BrunoVehicleHire.Application.Bookings.Dtos;
using BrunoVehicleHire.Domain.Entities;
using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.Repositories;
using BrunoVehicleHire.Domain.Services;
using BrunoVehicleHire.Domain.ValueObjects;
using MediatR;

namespace BrunoVehicleHire.Application.Bookings.Commands.CreateBooking;

public sealed class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BookingDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBookingOverlapChecker _overlapChecker;

    public CreateBookingCommandHandler(IUnitOfWork unitOfWork, IBookingOverlapChecker overlapChecker)
    {
        _unitOfWork = unitOfWork;
        _overlapChecker = overlapChecker;
    }

    public async Task<BookingDto> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var vehicle = await _unitOfWork.Vehicles.GetByIdAsync(request.VehicleId, cancellationToken)
            ?? throw new NotFoundException(nameof(Vehicle), request.VehicleId);

        if (vehicle.IsDeleted)
            throw new VehicleUnavailableException("Cannot book a vehicle that has been removed from the fleet.");

        var customer = await _unitOfWork.Customers.GetByIdAsync(request.CustomerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.CustomerId);

        var period = new DateRange(request.StartDate, request.EndDate);

        if (await _overlapChecker.HasOverlapAsync(vehicle.Id, period, ct: cancellationToken))
            throw new OverlappingBookingException("This vehicle is already booked for an overlapping date range.");

        var totalPrice = vehicle.DailyRate * period.TotalDays;
        var booking = Booking.Create(vehicle.Id, customer.Id, period, totalPrice);

        _unitOfWork.Bookings.Add(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return booking.ToDto();
    }
}
