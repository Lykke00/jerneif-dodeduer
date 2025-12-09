namespace Service.Services.Files;
using Microsoft.AspNetCore.Hosting;

public interface IFileService
{
    Task<string> SaveAsync(
        Stream stream,
        string originalFileName,
        string folder = "uploads");
}

public class FileService(IWebHostEnvironment env) : IFileService
{
    public async Task<string> SaveAsync(
        Stream stream,
        string originalFileName,
        string folder = "uploads")
    {
        var ext = Path.GetExtension(originalFileName);
        var fileName = $"{Guid.NewGuid()}{ext}";

        var root = Path.Combine(env.WebRootPath, folder);
        Directory.CreateDirectory(root);

        var path = Path.Combine(root, fileName);

        await using (var fileStream = new FileStream(path, FileMode.Create))
            await stream.CopyToAsync(fileStream);

        return fileName;
    }
}