using System.Net;
using System.Text.Json;
using BrunoVehicleHire.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace BrunoVehicleHire.Api.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = exception switch
        {
            ValidationException validationEx => BuildValidationProblem(validationEx),
            NotFoundException notFoundEx => BuildProblem(HttpStatusCode.NotFound, "Not Found", notFoundEx.Message),
            OverlappingBookingException overlapEx => BuildProblem(HttpStatusCode.Conflict, "Booking Conflict", overlapEx.Message, "vehicleId"),
            VehicleUnavailableException unavailableEx => BuildProblem(HttpStatusCode.Conflict, "Vehicle Unavailable", unavailableEx.Message, "vehicleId"),
            CustomerHasBookingsException hasBookingsEx => BuildProblem(HttpStatusCode.Conflict, "Customer Has Bookings", hasBookingsEx.Message),
            PastBookingDeletionException pastBookingEx => BuildProblem(HttpStatusCode.BadRequest, "Invalid Operation", pastBookingEx.Message),
            InvalidBookingStatusTransitionException invalidTransitionEx => BuildProblem(HttpStatusCode.BadRequest, "Invalid Operation", invalidTransitionEx.Message),
            InvalidDateRangeException invalidRangeEx => BuildProblem(HttpStatusCode.BadRequest, "Invalid Date Range", invalidRangeEx.Message, "endDate"),
            DuplicateEntityException duplicateEx => BuildProblem(HttpStatusCode.Conflict, "Duplicate Entity", duplicateEx.Message),
            DomainException domainEx => BuildProblem(HttpStatusCode.BadRequest, "Business Rule Violation", domainEx.Message),
            _ => BuildUnhandledProblem()
        };

        if (problemDetails.Status is >= 500)
            _logger.LogError(exception, "Unhandled exception processing {Method} {Path}", context.Request.Method, context.Request.Path);
        else
            _logger.LogWarning("Handled exception processing {Method} {Path}: {Message}", context.Request.Method, context.Request.Path, exception.Message);

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = problemDetails.Status ?? (int)HttpStatusCode.InternalServerError;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }

    private static ProblemDetails BuildValidationProblem(ValidationException validationEx)
    {
        var errors = validationEx.Errors
            .GroupBy(e => ToCamelCase(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        return new ValidationProblemDetails(errors)
        {
            Title = "One or more validation errors occurred.",
            Status = (int)HttpStatusCode.BadRequest,
            Detail = "One or more validation errors occurred."
        };
    }

    private static ProblemDetails BuildProblem(HttpStatusCode status, string title, string detail, string? field = null)
    {
        var problem = new ProblemDetails
        {
            Title = title,
            Status = (int)status,
            Detail = detail
        };

        if (field is not null)
            problem.Extensions["errors"] = new Dictionary<string, string[]> { [field] = new[] { detail } };

        return problem;
    }

    private static ProblemDetails BuildUnhandledProblem() => new()
    {
        Title = "An unexpected error occurred.",
        Status = (int)HttpStatusCode.InternalServerError,
        Detail = "An unexpected error occurred. Please try again later."
    };

    private static string ToCamelCase(string value) =>
        string.IsNullOrEmpty(value) ? value : char.ToLowerInvariant(value[0]) + value[1..];
}
