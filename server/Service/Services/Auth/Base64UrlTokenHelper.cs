using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;

namespace Service.Services.Auth;

public static class Base64UrlTokenHelper
{
    /// <summary>
    /// Generates a URL-safe Base64 encoded random token
    /// </summary>
    public static string GenerateToken(int sizeInBytes = 32)
    {
        var bytes = RandomNumberGenerator.GetBytes(sizeInBytes);
        return Base64UrlTextEncoder.Encode(bytes);
    }

    /// <summary>
    /// Decodes URL-safe Base64 string back to bytes
    /// </summary>
    public static byte[] DecodeBase64Url(string urlSafeToken)
    {
        return Base64UrlTextEncoder.Decode(urlSafeToken);
    }

    /// <summary>
    /// Computes SHA256 hash of a URL-safe Base64 token
    /// </summary>
    public static string ComputeHash(string urlSafeToken)
    {
        var bytes = DecodeBase64Url(urlSafeToken);
        
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(bytes);
        return Convert.ToHexString(hash);
    }
}