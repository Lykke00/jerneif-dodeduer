using System.Security.Claims;

namespace Api.Rest.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) return null;

        return Guid.TryParse(claim.Value, out var id) ? id : null;
    }
}
