namespace Service.Services.Email.Templates;

public static class MagicLinkEmailTemplate
{
    private const string Template = """
    <!DOCTYPE html>
    <html lang="da">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                margin: 0;
                padding: 0;
                background: #f2f4f7;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .wrapper {
                width: 100%;
                padding: 40px 0;
            }
            .card {
                max-width: 460px;
                margin: auto;
                background: #ffffff;
                border-radius: 12px;
                padding: 36px 30px;
                border: 1px solid #e5e7eb;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            h1 {
                font-size: 22px;
                font-weight: 600;
                color: #0f172a;
                margin: 0 0 18px 0;
            }
            p {
                color: #334155;
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 18px;
            }
            .btn {
                display: block;
                width: 100%;
                text-align: center;
                padding: 14px 22px;
                background: #0066ff;
                color: #ffffff !important;
                font-size: 15px;
                font-weight: 600;
                border-radius: 8px;
                text-decoration: none;
                box-sizing: border-box;
            }
            .btn:hover {
                background: #0053d6;
            }
            .footer {
                font-size: 12px;
                color: #64748b;
                margin-top: 22px;
                text-align: center;
            }
        </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <h1>JerneIF Døde Duer - Login</h1>
          <p>Klik på knappen herunder for at logge ind i JerneIf Døde Duer.</p>
          <p>Linket udløber om <strong>{ExpirationMinutes} minutter</strong>.</p>

          <p style="text-align:center; margin: 28px 0; width:100%;">
            <a href="{MagicLink}" class="btn">Log ind nu</a>
          </p>

          <p style="font-size:14px; color:#64748b;">
            Hvis du ikke har anmodet om dette login, kan du roligt ignorere denne e-mail.
          </p>

          <div class="footer">
            JerneIF — Døde Duer<br/>
            © {Year}
          </div>
        </div>
      </div>
    </body>
    </html>
    """;

    public static string Render(string magicLink, int expirationMinutes)
    {
        return Template
            .Replace("{MagicLink}", magicLink)
            .Replace("{ExpirationMinutes}", expirationMinutes.ToString())
            .Replace("{Year}", DateTime.UtcNow.Year.ToString());
    }
}
