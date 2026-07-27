using System.Text;
using Apotech.Backend.Models;
using Apotech.Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

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
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<INtpService, NtpService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IVerificationService, VerificationService>();
builder.Services.AddScoped<IAnsiService, AnsiService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();

// Register Background Hosted Services for GAMP 5 Continuous Monitoring
builder.Services.AddHostedService<NtpMonitoringHostedService>();

var app = builder.Build();

// Seed default user admin@dankos.com if missing
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (!db.Users.Any(u => u.Email == "admin@dankos.com"))
        {
            var adminRole = db.Roles.FirstOrDefault(r => r.Name == "ADMIN");
            if (adminRole == null)
            {
                adminRole = new Role
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = "ADMIN",
                    Description = "Administrator Role",
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                db.Roles.Add(adminRole);
            }

            var adminUser = new User
            {
                Id = Guid.NewGuid().ToString("N"),
                Email = "admin@dankos.com",
                Name = "System Administrator",
                Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            db.Users.Add(adminUser);

            db.UserRoles.Add(new UserRole
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = adminUser.Id,
                RoleId = adminRole.Id,
                CreatedAt = DateTime.Now
            });

            db.SaveChanges();
            Console.WriteLine("[SEED] Default admin user admin@dankos.com successfully seeded.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[SEED ERROR] Failed to seed admin user: {ex.Message}");
    }
}

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
