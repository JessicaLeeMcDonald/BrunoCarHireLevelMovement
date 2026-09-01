using BrunoVehicleHire.Domain.Services;

namespace BrunoVehicleHire.Infrastructure.Services;

public sealed class LocalVehicleImageStorage : IVehicleImageStorage
{
    private const string RelativeFolder = "vehicle-images";
    private readonly string _rootPath;

    public LocalVehicleImageStorage(string webRootPath)
    {
        _rootPath = Path.Combine(webRootPath, RelativeFolder);
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(Guid vehicleId, Stream content, string fileExtension, CancellationToken ct = default)
    {
        foreach (var existing in Directory.EnumerateFiles(_rootPath, $"{vehicleId}.*"))
            File.Delete(existing);

        var fileName = $"{vehicleId}{fileExtension}";
        var fullPath = Path.Combine(_rootPath, fileName);

        await using (var fileStream = File.Create(fullPath))
            await content.CopyToAsync(fileStream, ct);

        return $"/{RelativeFolder}/{fileName}";
    }

    public Task DeleteAsync(string? imageUrl, CancellationToken ct = default)
    {
        ct.ThrowIfCancellationRequested();

        if (string.IsNullOrWhiteSpace(imageUrl))
            return Task.CompletedTask;

        var fullPath = Path.Combine(_rootPath, Path.GetFileName(imageUrl));
        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
