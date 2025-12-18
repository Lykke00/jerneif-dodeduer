using DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Moq;
using Service.DTO.Deposit;
using Service.Options;
using Service.Services.Deposit;
using Service.Services.Files;
using Service.Services.User;
using tests.Helpers;

namespace tests.Services.Deposit;

public class DepositServiceTests
{
    private readonly AppDbContext _db;
    private readonly IDepositService _service;

    public DepositServiceTests()
    {
        // 1. Lokal database (én pr. testklasse)
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new AppDbContext(options);

        // 2. Afhængige services (lokale)
        var userBalanceService = new UserBalanceService(_db);

        // 3. FileService → mock (IKKE rigtig fil-I/O i service-tests)
        var fileService = new Mock<IFileService>();

        // 4. AppOptions → test-options
        var appOptions = Options.Create(new AppOptions
        {
            FrontendUrl = "http://localhost",
            BackendUrl = "http://localhost",
            DbConnectionString = "InMemory",
            ResendApiKey = "test",
            Jwt = new JwtOptions
            {
                Secret = "TEST_SECRET_123456789",
                Issuer = "test",
                Audience = "test",
                AccessTokenMinutes = 5,
                RefreshTokenDays = 1
            }
        });

        // 5. Service under test
        _service = new DepositService(
            _db,
            userBalanceService,
            fileService.Object,
            appOptions
        );
    }
    
    [Fact]
    public async Task CreateDeposit_ValidRequest_ReturnsDepositResponseOk()
    {
        // arrange
        var user = await TestDataFactory.CreateUserAsync(_db, "depositUser@gmail.com");
        var request = new DepositRequest
        {
            Amount = 40,
            PaymentId = "12345MobilePayId54321"
        };
        
        var createdDeposit = await _service.DepositAsync(user.Id, request);
        
        // assert
        Assert.NotNull(createdDeposit.Value);
        Assert.Equal(request.Amount, createdDeposit.Value.Amount);
        Assert.Equal(request.PaymentId, createdDeposit.Value.PaymentId);
        Assert.True(createdDeposit.Success);
    }

    [Fact]
    public async Task ApproveDeposit_ValidRequest_ReturnsDepositResponseOk()
    {
        // arrange
        var user = await TestDataFactory.CreateUserAsync(_db, "depositUser@gmail.com");
        var request = new DepositRequest
        {
            Amount = 40,
            PaymentId = "12345MobilePayId54321"
        };
        
        // act
        var createdDeposit = await _service.DepositAsync(user.Id, request);
        if (createdDeposit.Value == null)
            Assert.Fail("Failed  to create deposit.");

        var approveRequest = new UpdateDepositStatusRequest
        {
            Status = "approved"
        };

        var approveDeposit = await _service.UpdateDepositStatusAsync(createdDeposit.Value.Id, approveRequest);
        
        // assert
        Assert.NotNull(approveDeposit.Value);
        Assert.True(approveDeposit.Success);
        Assert.Equal(200, approveDeposit.StatusCode);
    }
    
    [Fact]
    public async Task ApproveDeposit_DepositDoesntExist_ReturnsError()
    {
        // arrange
        var depositId = Guid.NewGuid();
        var approveRequest = new UpdateDepositStatusRequest
        {
            Status = "approved"
        };

        // act
        var approveDeposit = await _service.UpdateDepositStatusAsync(depositId, approveRequest);
        
        // assert
        Assert.Null(approveDeposit.Value);
        Assert.False(approveDeposit.Success);
        Assert.Equal(404, approveDeposit.StatusCode);
    }
}