using System.ComponentModel.DataAnnotations;

namespace Service.Options;

public sealed class AppOptions
{
    [Required]
    public string FrontendUrl { get; set; } = null!;
    
    [Required]
    public string BackendUrl { get; set; } = null!;
    
    [Required]
    public string DbConnectionString { get; set; } = null!;
    
    [Required]
    public string ResendApiKey { get; set; } = null!;
    
    [Required]
    public JwtOptions Jwt { get; set; } = null!;
}