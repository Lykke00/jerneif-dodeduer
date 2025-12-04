using System.Security.Cryptography;

namespace Service.Services.Auth;

public class TokenService
{
    public static string GenerateRawToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var base64 = Convert.ToBase64String(bytes);
        return base64.Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
    
    public static string ComputeHash(string urlSafeToken)
    {
        var normalized = urlSafeToken
            .Replace('-', '+')
            .Replace('_', '/');
        normalized = normalized.PadRight(
            normalized.Length + (4 - normalized.Length % 4) % 4, '=');
        
        var decodedBytes = Convert.FromBase64String(normalized);
        
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(decodedBytes);
        return Convert.ToHexString(hash);
    }
}