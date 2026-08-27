using BrunoVehicleHire.Application.Common.Models;
using BrunoVehicleHire.Application.Customers.Commands.CreateCustomer;
using BrunoVehicleHire.Application.Customers.Commands.DeleteCustomer;
using BrunoVehicleHire.Application.Customers.Commands.UpdateCustomer;
using BrunoVehicleHire.Application.Customers.Dtos;
using BrunoVehicleHire.Application.Customers.Queries.GetCustomerById;
using BrunoVehicleHire.Application.Customers.Queries.GetCustomersList;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BrunoVehicleHire.Api.Controllers;

/// <summary>Manages customers.</summary>
[ApiController]
[Authorize]
[Route("api/customers")]
public sealed class CustomersController : ControllerBase
{
    private readonly ISender _sender;

    public CustomersController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Get a paged, searchable list of customers.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CustomerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetList(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetCustomersListQuery(pageNumber, pageSize, search), ct);
        return Ok(result);
    }

    /// <summary>Get a single customer by id.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new GetCustomerByIdQuery(id), ct);
        return Ok(result);
    }

    /// <summary>Register a new customer.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CustomerDto>> Create([FromBody] CreateCustomerCommand command, CancellationToken ct)
    {
        var result = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an existing customer's contact details.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CustomerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomerDto>> Update(Guid id, [FromBody] UpdateCustomerRequest request, CancellationToken ct)
    {
        var result = await _sender.Send(new UpdateCustomerCommand(id, request.FirstName, request.LastName, request.PhoneNumber), ct);
        return Ok(result);
    }

    /// <summary>Delete a customer. Fails if the customer has any bookings.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _sender.Send(new DeleteCustomerCommand(id), ct);
        return NoContent();
    }
}

/// <summary>Request body for updating a customer's mutable contact details.</summary>
public sealed record UpdateCustomerRequest(string FirstName, string LastName, string PhoneNumber);
