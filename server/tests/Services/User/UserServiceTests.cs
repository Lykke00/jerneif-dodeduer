using DataAccess;
using Service.DTO.User;
using Service.Services.User;
using tests.Helpers;

namespace tests.Services.User;

public class UserServiceTests
{
    private readonly AppDbContext _db;
    private readonly IUserService _service;

    public UserServiceTests(AppDbContext db, IUserService service)
    {
        _db = db;
        _service = service;
    }

    [Fact]
    public async Task GetById_UserExists_ReturnsUser()
    {
        // arrange
        var email = "test@test.com";
        var createdUser = await TestDataFactory.CreateUserAsync(_db, email);
        
        // act
        var result = await _service.GetByIdAsync(createdUser.Id);
        
        // assert
        Assert.NotNull(result.Value);
        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);
        Assert.Equal(createdUser.Id, result.Value.Id);
    }
    
    [Fact]
    public async Task GetById_UserDoesntExists_ReturnsError()
    {
        // arrange
        var userId = Guid.NewGuid();
        
        // act
        var result = await _service.GetByIdAsync(userId);
        
        Assert.Null(result.Value);
        Assert.False(result.Success);
        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task GetUsers_WithValidPaging_ReturnsPagedResult()
    {
        // arrange
        var pageSize = 10;
        var page = 1;
        var request = new AllUserRequest
        {
            Page = page,
            PageSize = pageSize
        };
        
        var user1 = await TestDataFactory.CreateUserAsync(_db, "torben@gmail.com");
        var user2 = await TestDataFactory.CreateUserAsync(_db, "henning@gmail.com");
        var user3 = await TestDataFactory.CreateUserAsync(_db, "karsten@gmail.com");

        
        var users = await _service.GetUsersAsync(request);
        
        Assert.NotNull(users);
        Assert.Equal(users.Page, page);
        Assert.Equal(users.PageSize, pageSize);
        Assert.Equal(3, users.Items.Count);
        
        var emails = users.Items.Select(u => u.Email).ToList();

        Assert.Contains(user1.Email, emails);
        Assert.Contains(user2.Email, emails);
        Assert.Contains(user3.Email, emails);
    }

    [Fact]
    public async Task CreateUser_ValidRegistration_ReturnsUserDtoExtended()
    {
        // arrange
        var request = new CreateUserRequest
        {
            Email = "ole@gmail.com",
            FirstName = "Ole",
            LastName = "Ole",
            Phone = "12345678",
            Admin = false,
        };
        
        // act
        var createdUser = await _service.CreateUserAsync(request);
        
        // assert
        Assert.NotNull(createdUser.Value);
        Assert.Equal(200, createdUser.StatusCode);
        Assert.NotEqual(Guid.Empty, createdUser.Value.Id);
        Assert.Equal("Ole", createdUser.Value.FirstName);
        Assert.Equal("Ole", createdUser.Value.LastName);
        Assert.Equal("12345678", createdUser.Value.Phone);
        Assert.False(createdUser.Value.IsAdmin);
        Assert.True(createdUser.Value.IsActive);
    }
    
    [Fact]
    public async Task CreateUser_InvalidRegistration_ReturnsError()
    {
        // arrange
        var request = new CreateUserRequest
        {
            Email = "ole@gmail.com",
            FirstName = "Ole",
            LastName = "Ole",
            Phone = "12345678",
            Admin = false,
        };
        
        // act
        await _service.CreateUserAsync(request);
        var createdUserFailure = await _service.CreateUserAsync(request);

        // assert
        Assert.Null(createdUserFailure.Value);
        Assert.Equal(400, createdUserFailure.StatusCode);
        Assert.False(createdUserFailure.Success);
    }

    [Fact]
    public async Task UpdateUser_ValidRequest_ReturnsUserDtoExtended()
    {
        // arrange
        var oldEmail = "torben@gmail.com";
        var newEmail = "nytorben@gmail.com";
        var user = await TestDataFactory.CreateUserAsync(_db, oldEmail);

        var request = new UpdateUserRequest
        {
            Email = newEmail
        };
        
        // act
        var updatedUser = await _service.UpdateUserAsync(user.Id, request);
        
        // assert
        Assert.NotNull(updatedUser.Value);
        Assert.Equal(200, updatedUser.StatusCode);
        Assert.Equal(user.Id, updatedUser.Value.Id);
        Assert.NotEqual(oldEmail, updatedUser.Value.Email);
    }

    [Fact]
    public async Task UpdateUser_UserDoesntExist_ReturnsError()
    {
        // arrange
        var userId = Guid.NewGuid();
        
        // act
        var updateUser = await _service.UpdateUserAsync(userId, new UpdateUserRequest());
        
        // assert
        Assert.Null(updateUser.Value);
        Assert.False(updateUser.Success);
        Assert.Equal(404, updateUser.StatusCode);
    }
}