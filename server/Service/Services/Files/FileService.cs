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

        var rootPath = env.WebRootPath;
        if (string.IsNullOrWhiteSpace(rootPath))
            rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        
        Directory.CreateDirectory(rootPath);

        var targetFolder = Path.Combine(rootPath, folder);
        Directory.CreateDirectory(targetFolder);

        var path = Path.Combine(targetFolder, fileName);

        await using (var fileStream = new FileStream(path, FileMode.Create))
            await stream.CopyToAsync(fileStream);

        return fileName;
    }
}