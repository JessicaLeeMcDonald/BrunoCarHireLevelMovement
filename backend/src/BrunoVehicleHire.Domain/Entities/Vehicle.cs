namespace BrunoVehicleHire.Domain.Entities;

public sealed class Vehicle : BaseEntity
{
    public string RegistrationNumber { get; private set; } = default!;
    public string Make { get; private set; } = default!;
    public string Model { get; private set; } = default!;
    public int Year { get; private set; }
    public decimal DailyRate { get; private set; }
    public bool IsDeleted { get; private set; }

    private Vehicle()
    {
    }

    public static Vehicle Create(string registrationNumber, string make, string model, int year, decimal dailyRate)
    {
        if (string.IsNullOrWhiteSpace(registrationNumber))
            throw new ArgumentException("Registration number is required.", nameof(registrationNumber));
        if (string.IsNullOrWhiteSpace(make))
            throw new ArgumentException("Make is required.", nameof(make));
        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Model is required.", nameof(model));
        if (dailyRate <= 0)
            throw new ArgumentOutOfRangeException(nameof(dailyRate), "Daily rate must be greater than zero.");

        return new Vehicle
        {
            RegistrationNumber = registrationNumber.Trim(),
            Make = make.Trim(),
            Model = model.Trim(),
            Year = year,
            DailyRate = dailyRate
        };
    }

    public void UpdateDetails(string make, string model, int year, decimal dailyRate)
    {
        if (string.IsNullOrWhiteSpace(make))
            throw new ArgumentException("Make is required.", nameof(make));
        if (string.IsNullOrWhiteSpace(model))
            throw new ArgumentException("Model is required.", nameof(model));
        if (dailyRate <= 0)
            throw new ArgumentOutOfRangeException(nameof(dailyRate), "Daily rate must be greater than zero.");

        Make = make.Trim();
        Model = model.Trim();
        Year = year;
        DailyRate = dailyRate;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
    }
}
