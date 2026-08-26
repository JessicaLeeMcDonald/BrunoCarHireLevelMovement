using BrunoVehicleHire.Domain.Exceptions;

namespace BrunoVehicleHire.Domain.ValueObjects;

public sealed class DateRange : IEquatable<DateRange>
{
    public DateTime Start { get; private set; }
    public DateTime End { get; private set; }

    private DateRange()
    {
    }

    public DateRange(DateTime start, DateTime end)
    {
        if (end <= start)
            throw new InvalidDateRangeException("EndDate must be greater than StartDate.");

        Start = start;
        End = end;
    }

    public int TotalDays => Math.Max(1, (End - Start).Days);

    public bool OverlapsWith(DateRange other) => Start < other.End && other.Start < End;

    public bool Equals(DateRange? other) => other is not null && Start == other.Start && End == other.End;

    public override bool Equals(object? obj) => Equals(obj as DateRange);

    public override int GetHashCode() => HashCode.Combine(Start, End);
}
