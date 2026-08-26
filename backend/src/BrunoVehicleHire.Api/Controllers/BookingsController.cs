using BrunoVehicleHire.Application.Bookings.Commands.CancelBooking;
using BrunoVehicleHire.Application.Bookings.Commands.CompleteBooking;
using BrunoVehicleHire.Application.Bookings.Commands.CreateBooking;
using BrunoVehicleHire.Application.Bookings.Commands.DeleteBooking;
using BrunoVehicleHire.Application.Bookings.Dtos;
using BrunoVehicleHire.Application.Bookings.Queries.GetBookingById;
using BrunoVehicleHire.Application.Bookings.Queries.GetBookingsList;
using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Api.Examples;
using BrunoVehicleHire.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Filters;

namespace BrunoVehicleHire.Api.Controllers;

/// <summary>Manages vehicle bookings.</summary>
[ApiController]
[Authorize]
[Route("api/bookings")]
public sealed class BookingsController : ControllerBase
{
    private readonly ISender _sender;

    public BookingsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Get a paged, filterable list of bookings.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<BookingDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<BookingDto>>> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? vehicleId = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] BookingStatus? status = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetBookingsListQuery(pageNumber, pageSize, vehicleId, customerId, status, from, to), ct);
        return Ok(result);
    }

    /// <summary>Get a single booking by id.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BookingDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new GetBookingByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Create a new booking. Fails with 409 if the vehicle is unavailable or the dates overlap an existing booking.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(BookingDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerRequestExample(typeof(CreateBookingCommand), typeof(CreateBookingCommandExample))]
    public async Task<ActionResult<BookingDto>> Create([FromBody] CreateBookingCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Cancel an active booking.</summary>
    [HttpPatch("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        await _sender.Send(new CancelBookingCommand(id), ct);
        return NoContent();
    }

    /// <summary>Mark an active booking as completed.</summary>
    [HttpPatch("{id:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete(Guid id, CancellationToken ct)
    {
        await _sender.Send(new CompleteBookingCommand(id), ct);
        return NoContent();
    }

    /// <summary>Delete a booking. Only future, active bookings can be deleted.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _sender.Send(new DeleteBookingCommand(id), ct);
        return NoContent();
    }
}
