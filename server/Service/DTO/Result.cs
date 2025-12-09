namespace Service.DTO;

public record Result<T>
{
    public bool Success { get; init; }
    public T? Value { get; init; }
    public int StatusCode { get; init; }
    public Dictionary<string, string[]> Errors { get; init; } = new();

    // 200
    public static Result<T> Ok(T value) =>
        new() { Success = true, Value = value, StatusCode = 200 };

    // 400
    public static Result<T> ValidationError(Dictionary<string, string[]> errors) =>
        new()
        {
            Success = false,
            StatusCode = 400,
            Errors = errors
        };

    // 400 - with custom key
    public static Result<T> ValidationError(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 400,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };

    
    // 401
    public static Result<T> Unauthorized(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 401,
            Errors = new Dictionary<string, string[]> { { "General", errors } }
        };
    
    // 401 - with custom key
    public static Result<T> Unauthorized(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 401,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };

    // 403
    public static Result<T> Forbidden(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 403,
            Errors = new Dictionary<string, string[]> { { "General", errors } }
        };
    
    // 403 - with custom key
    public static Result<T> Forbidden(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 403,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };

    // 404
    public static Result<T> NotFound(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 404,
            Errors = new Dictionary<string, string[]> { { "General", errors } }
        };
    
    // 404 - with custom key
    public static Result<T> NotFound(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 404,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };

    // 409
    public static Result<T> Conflict(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 409,
            Errors = new Dictionary<string, string[]> { { "General", errors } }
        };
    
    // 409 - with custom key
    public static Result<T> Conflict(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 409,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };

    // 500
    public static Result<T> InternalError(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 500,
            Errors = new Dictionary<string, string[]> { { "General", errors } }
        };
    
    // 500 - with custom key
    public static Result<T> InternalError(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 500,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };
    
    // 400
    public static Result<T> BadRequest(params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 400,
            Errors = new Dictionary<string, string[]> { { "General", errors } }
        };

    
    // 400 - with custom key
    public static Result<T> BadRequest(string key, params string[] errors) =>
        new()
        {
            Success = false,
            StatusCode = 400,
            Errors = new Dictionary<string, string[]> { { key, errors } }
        };

    
    public static Result<T> FromResult<U>(Result<U> other)
    {
        return new Result<T>
        {
            Success = other.Success,
            StatusCode = other.StatusCode,
            Errors = other.Errors
        };
    }
}