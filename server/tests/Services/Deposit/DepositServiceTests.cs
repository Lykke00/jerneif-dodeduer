using DataAccess;
using Service.DTO.Deposit;
using Service.Services.Deposit;
using tests.Helpers;

namespace tests.Services.Deposit;

public class DepositServiceTests
{
    private readonly AppDbContext _db;
    private readonly IDepositService _service;

    public DepositServiceTests(AppDbContext db, IDepositService service)
    {
        _db = db;
        _service = service;
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