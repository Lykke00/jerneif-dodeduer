using System.Text;
using System.Text.Json;

namespace Api.Rest.Middleware;

public class ResultMiddleware
{
    private readonly RequestDelegate _next;

    public ResultMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var originalBody = context.Response.Body;

        await using var memStream = new MemoryStream();
        context.Response.Body = memStream;

        await _next(context);

        memStream.Seek(0, SeekOrigin.Begin);

        // Read body
        var body = await new StreamReader(memStream).ReadToEndAsync();

        // Detect status code from JSON
        if (TryReadStatusCode(body, out var statusCode))
        {
            context.Response.StatusCode = statusCode;
        }

        context.Response.Body = originalBody;

        if (string.IsNullOrEmpty(body))
        {
            return;
        }

        context.Response.ContentType ??= "application/json";

        await context.Response.WriteAsync(body, Encoding.UTF8);
    }

    private bool TryReadStatusCode(string body, out int statusCode)
    {
        statusCode = 200;

        try
        {
            using var doc = JsonDocument.Parse(body);

            if (!doc.RootElement.TryGetProperty("statusCode", out var prop))
                return false;

            if (prop.ValueKind == JsonValueKind.Number)
            {
                statusCode = prop.GetInt32();
                return true;
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
}