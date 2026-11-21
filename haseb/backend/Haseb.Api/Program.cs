var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();
app.MapGet("/health", () => Results.Ok(new {
    status = "ok",
    service = "haseb-api",
    utc = DateTimeOffset.UtcNow
}));
app.MapGet("/api/v1", () => Results.Ok(new {
    name = "HASEB Distribution Core",
    version = "0.1.0",
    status = "starter"
}));
app.Run();
