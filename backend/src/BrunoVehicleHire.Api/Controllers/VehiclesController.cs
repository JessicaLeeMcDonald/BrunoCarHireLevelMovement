using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Application.Vehicles.Commands.CreateVehicle;
using BrunoVehicleHire.Application.Vehicles.Commands.DeleteVehicleImage;
using BrunoVehicleHire.Application.Vehicles.Commands.SoftDeleteVehicle;
using BrunoVehicleHire.Application.Vehicles.Commands.UpdateVehicle;
using BrunoVehicleHire.Application.Vehicles.Commands.UpdateVehicleImage;
using BrunoVehicleHire.Application.Vehicles.Dtos;
using BrunoVehicleHire.Application.Vehicles.Queries.GetVehicleById;
using BrunoVehicleHire.Application.Vehicles.Queries.GetVehiclesList;
using BrunoVehicleHire.Api.Examples;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Filters;

namespace BrunoVehicleHire.Api.Controllers;

/// <summary>Manages the vehicle fleet.</summary>
[ApiController]
[Authorize]
[Route("api/vehicles")]
public sealed class VehiclesController : ControllerBase
{
    private readonly ISender _sender;

    public VehiclesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Get a paged, filterable list of vehicles.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<VehicleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<VehicleDto>>> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? make = null,
        [FromQuery] string? model = null,
        [FromQuery] bool? availableOnly = null,
        [FromQuery] bool includeDeleted = false,
        [FromQuery] DateTime? availableFrom = null,
        [FromQuery] DateTime? availableTo = null,
        CancellationToken ct = default)
    {
        var result = await _sender.Send(
            new GetVehiclesListQuery(pageNumber, pageSize, make, model, availableOnly, includeDeleted, availableFrom, availableTo), ct);
        return Ok(result);
    }

    /// <summary>Get a single vehicle by id.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new GetVehicleByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Register a new vehicle in the fleet.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerRequestExample(typeof(CreateVehicleCommand), typeof(CreateVehicleCommandExample))]
    public async Task<ActionResult<VehicleDto>> Create([FromBody] CreateVehicleCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an existing vehicle's details.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDto>> Update(Guid id, [FromBody] UpdateVehicleRequest request, CancellationToken ct)
    {
        var result = await _sender.Send(new UpdateVehicleCommand(id, request.Make, request.Model, request.Year, request.DailyRate), ct);
        return Ok(result);
    }

    /// <summary>Soft-delete a vehicle. It will no longer be bookable or appear in listings.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SoftDelete(Guid id, CancellationToken ct)
    {
        await _sender.Send(new SoftDeleteVehicleCommand(id), ct);
        return NoContent();
    }

    /// <summary>Upload or replace a vehicle's photo. Accepts JPEG, PNG or WEBP up to 5 MB.</summary>
    [HttpPost("{id:guid}/image")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [RequestSizeLimit(MaxImageBytes)]
    public async Task<ActionResult<VehicleDto>> UploadImage(Guid id, IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("An image file is required.");
        if (file.Length > MaxImageBytes)
            return BadRequest("Image must be 5 MB or smaller.");
        if (!AllowedImageContentTypes.TryGetValue(file.ContentType, out var extension))
            return BadRequest("Image must be JPEG, PNG or WEBP.");

        await using var stream = file.OpenReadStream();
        var result = await _sender.Send(new UpdateVehicleImageCommand(id, stream, extension), ct);
        return Ok(result);
    }

    /// <summary>Remove a vehicle's photo.</summary>
    [HttpDelete("{id:guid}/image")]
    [ProducesResponseType(typeof(VehicleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VehicleDto>> DeleteImage(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new DeleteVehicleImageCommand(id), ct);
        return Ok(result);
    }

    private const long MaxImageBytes = 5 * 1024 * 1024;

    private static readonly Dictionary<string, string> AllowedImageContentTypes = new()
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
    };
}

/// <summary>Request body for updating a vehicle's mutable details.</summary>
public sealed record UpdateVehicleRequest(string Make, string Model, int Year, decimal DailyRate);
