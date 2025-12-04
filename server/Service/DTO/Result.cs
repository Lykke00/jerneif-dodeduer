namespace Service.DTO;

public record Result<T>
{
    public bool Success { get; init; }
    public T? Value { get; init; }
    public int StatusCode { get; init; }
    public List<string> Errors { get; init; } = new();

    // 200
    public static Result<T> Ok(T value) =>
        new() { Success = true, Value = value, StatusCode = 200 };

    // 400
    public static Result<T> ValidationError(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 400,
            Errors = errors.ToList()
        };

    // 401
    public static Result<T> Unauthorized(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 401,
            Errors = errors.ToList()
        };

    // 403
    public static Result<T> Forbidden(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 403,
            Errors = errors.ToList()
        };

    // 404
    public static Result<T> NotFound(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 404,
            Errors = errors.ToList()
        };

    // 409
    public static Result<T> Conflict(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 409,
            Errors = errors.ToList()
        };

    // 500
    public static Result<T> InternalError(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 500,
            Errors = errors.ToList()
        };
}
