namespace BrunoVehicleHire.Domain.Services;

public interface IVehicleImageStorage
{
    Task<string> SaveAsync(Guid vehicleId, Stream content, string fileExtension, CancellationToken ct = default);

    void Delete(string? imageUrl);
}
