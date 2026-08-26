using BrunoVehicleHire.Domain.Exceptions;
using BrunoVehicleHire.Domain.ValueObjects;
using FluentAssertions;

namespace BrunoVehicleHire.Tests.Domain;

public class DateRangeOverlapTests
{
    [Fact]
    public void Constructor_WhenEndDateIsNotAfterStartDate_ThrowsInvalidDateRangeException()
    {
        var date = new DateTime(2026, 9, 10);

        var act = () => new DateRange(date, date);

        act.Should().Throw<InvalidDateRangeException>();
    }

    [Theory]
    [InlineData("2026-09-10", "2026-09-15", "2026-09-12", "2026-09-18", true)]
    [InlineData("2026-09-10", "2026-09-15", "2026-09-15", "2026-09-20", false)]
    [InlineData("2026-09-10", "2026-09-15", "2026-09-20", "2026-09-25", false)]
    [InlineData("2026-09-10", "2026-09-20", "2026-09-12", "2026-09-18", true)]
    public void OverlapsWith_DetectsOverlapCorrectly(string aStart, string aEnd, string bStart, string bEnd, bool expectedOverlap)
    {
        var a = new DateRange(DateTime.Parse(aStart), DateTime.Parse(aEnd));
        var b = new DateRange(DateTime.Parse(bStart), DateTime.Parse(bEnd));

        a.OverlapsWith(b).Should().Be(expectedOverlap);
        b.OverlapsWith(a).Should().Be(expectedOverlap);
    }
}
