using Microsoft.Extensions.Options;
using Resend;
using Service.Options;
using Service.Services.Email.Templates;

namespace Service.Services.Email;

public interface IEmailService
{
    Task<bool> SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
    Task<bool> SendMagicLinkAsync(string to, string token, CancellationToken ct = default);
}

public class EmailService(IResend resend, IOptions<AppOptions> appOptions) : IEmailService
{
    public async Task<bool> SendAsync(string to, string subject, string htmlBody, CancellationToken ct)
    {
        var message = new EmailMessage
        {
            From = "JerneIF <post@erhvervsportaler.dk>",
            Subject = subject,
            HtmlBody = htmlBody
        };
        
        message.To.Add(to);
        
        await resend.EmailSendAsync(message, ct);
        
        return true;
    }

    public async Task<bool> SendMagicLinkAsync(string to, string token, CancellationToken ct)
    {
        var verifyUrl = $"{appOptions.Value.FrontendUrl}/auth/verify?token={token}";
        var html = MagicLinkEmailTemplate.Render(
            magicLink: verifyUrl,
            expirationMinutes: 15
        );

        return await SendAsync(to, "JerneIF - Login Anmodning", html, ct);
    }

}