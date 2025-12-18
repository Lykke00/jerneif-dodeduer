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
        // få fat i fil extension, f.eks: .jpg, .png, .jpeg
        var ext = Path.GetExtension(originalFileName);
        
        // lav derefter et nyt fil navn med en guid
        var fileName = $"{Guid.NewGuid()}{ext}";

        // få fat i path
        var rootPath = env.WebRootPath;
        if (string.IsNullOrWhiteSpace(rootPath))
            rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        
        // opret mappen
        Directory.CreateDirectory(rootPath);

        // få fat i folderen hvor billedet skal hen og opret mappen
        var targetFolder = Path.Combine(rootPath, folder);
        Directory.CreateDirectory(targetFolder);

        var path = Path.Combine(targetFolder, fileName);

        // gem filen i mappen
        await using (var fileStream = new FileStream(path, FileMode.Create))
            await stream.CopyToAsync(fileStream);

        // returner det nye filnavn
        return fileName;
    }
}