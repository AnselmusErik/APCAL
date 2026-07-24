using System.Text;
using Apotech.Backend.Models;
using Apotech.Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext — register custom PostgreSQL enums at DataSource level
// Required by Npgsql: custom enum types must be mapped on the connection/data source,
// not just in OnModelCreating, otherwise SaveChangesAsync throws on enum serialization.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Database=apotek_sample;Username=virgiseptian";

var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<UnitType>("UnitType");
dataSourceBuilder.MapEnum<InspectionGeneralLevel>("InspectionGeneralLevel");
dataSourceBuilder.MapEnum<ContainerType>("ContainerType");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(dataSource));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your_super_secret_key_which_is_at_least_32_bytes_long";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

// Add Controllers
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVerificationService, VerificationService>();
builder.Services.AddScoped<IAnsiService, AnsiService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowNextJs");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
