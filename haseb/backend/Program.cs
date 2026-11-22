var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "haseb-api",
    utc = DateTime.UtcNow
}));

app.Run();
