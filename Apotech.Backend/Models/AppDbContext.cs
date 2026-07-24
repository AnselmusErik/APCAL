using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<ProblemFinding> ProblemFindings { get; set; }

    public virtual DbSet<ProblemVerification> ProblemVerifications { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<RolePermission> RolePermissions { get; set; }

    public virtual DbSet<SamplingHistory> SamplingHistories { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<VerificationToken> VerificationTokens { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Only configure if not already configured by DI (Program.cs).
        // This fallback is used only for EF Core tooling (e.g., dotnet ef migrations).
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=localhost;Database=apotek_sample;Username=virgiseptian");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("ContainerType", new[] { "WADAH", "KANTONG", "BAK", "MB" })
            .HasPostgresEnum("InspectionGeneralLevel", new[] { "I", "II", "III" })
            .HasPostgresEnum("UnitType", new[] { "TABLET", "KAPLET", "KAPSUL", "SOFT_KAPSUL", "VIAL", "AMPUL", "BLISTER", "STRIP", "BOTOL", "KAFT" });

        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("accounts_pkey");

            entity.ToTable("accounts");

            entity.HasIndex(e => new { e.Provider, e.ProviderAccountId }, "accounts_provider_providerAccountId_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AccessToken).HasColumnName("access_token");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.IdToken).HasColumnName("id_token");
            entity.Property(e => e.Provider).HasColumnName("provider");
            entity.Property(e => e.ProviderAccountId).HasColumnName("providerAccountId");
            entity.Property(e => e.RefreshToken).HasColumnName("refresh_token");
            entity.Property(e => e.Scope).HasColumnName("scope");
            entity.Property(e => e.SessionState).HasColumnName("session_state");
            entity.Property(e => e.TokenType).HasColumnName("token_type");
            entity.Property(e => e.Type).HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.Accounts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("accounts_userId_fkey");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("permissions_pkey");

            entity.ToTable("permissions");

            entity.HasIndex(e => e.Name, "permissions_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<ProblemFinding>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("problem_findings_pkey");

            entity.ToTable("problem_findings");

            entity.HasIndex(e => new { e.VerificationId, e.Position }, "problem_findings_verificationId_position_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FindingCount).HasColumnName("findingCount");
            entity.Property(e => e.Label).HasColumnName("label");
            entity.Property(e => e.Position).HasColumnName("position");
            entity.Property(e => e.VerificationId).HasColumnName("verificationId");

            entity.HasOne(d => d.Verification).WithMany(p => p.ProblemFindings)
                .HasForeignKey(d => d.VerificationId)
                .HasConstraintName("problem_findings_verificationId_fkey");
        });

        modelBuilder.Entity<ProblemVerification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("problem_verifications_pkey");

            entity.ToTable("problem_verifications");

            entity.HasIndex(e => e.BatchNumber, "problem_verifications_batchNumber_idx");

            entity.HasIndex(e => e.Date, "problem_verifications_date_idx");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AqlCriteria).HasColumnName("aqlCriteria");
            entity.Property(e => e.BatchNumber).HasColumnName("batchNumber");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.CreatedById).HasColumnName("createdById");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.Kesimpulan).HasColumnName("kesimpulan");
            entity.Property(e => e.Keterangan).HasColumnName("keterangan");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.ProductCode).HasColumnName("productCode");
            entity.Property(e => e.SampleSize).HasColumnName("sampleSize");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");

            entity.HasOne(d => d.CreatedBy).WithMany(p => p.ProblemVerifications)
                .HasForeignKey(d => d.CreatedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("problem_verifications_createdById_fkey");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.Name, "roles_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("role_permissions_pkey");

            entity.ToTable("role_permissions");

            entity.HasIndex(e => new { e.RoleId, e.PermissionId }, "role_permissions_roleId_permissionId_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.PermissionId).HasColumnName("permissionId");
            entity.Property(e => e.RoleId).HasColumnName("roleId");

            entity.HasOne(d => d.Permission).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.PermissionId)
                .HasConstraintName("role_permissions_permissionId_fkey");

            entity.HasOne(d => d.Role).WithMany(p => p.RolePermissions)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("role_permissions_roleId_fkey");
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sessions_pkey");

            entity.ToTable("sessions");

            entity.HasIndex(e => e.SessionToken, "sessions_sessionToken_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Expires)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("expires");
            entity.Property(e => e.SessionToken).HasColumnName("sessionToken");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.Sessions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("sessions_userId_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.EmailVerified)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("emailVerified");
            entity.Property(e => e.Image).HasColumnName("image");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("updatedAt");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_roles_pkey");

            entity.ToTable("user_roles");

            entity.HasIndex(e => new { e.UserId, e.RoleId }, "user_roles_userId_roleId_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");
            entity.Property(e => e.RoleId).HasColumnName("roleId");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("user_roles_roleId_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_roles_userId_fkey");
        });

        modelBuilder.Entity<VerificationToken>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("verification_tokens");

            entity.HasIndex(e => new { e.Identifier, e.Token }, "verification_tokens_identifier_token_key").IsUnique();

            entity.HasIndex(e => e.Token, "verification_tokens_token_key").IsUnique();

            entity.Property(e => e.Expires)
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("expires");
            entity.Property(e => e.Identifier).HasColumnName("identifier");
            entity.Property(e => e.Token).HasColumnName("token");
        });

        OnModelCreatingPartial(modelBuilder);

        // ─── SamplingHistory ────────────────────────────────────────────────
        modelBuilder.Entity<SamplingHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("sampling_histories_pkey");
            entity.ToTable("sampling_histories");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ProductName).HasColumnName("productName");
            entity.Property(e => e.BatchNumber).HasColumnName("batchNumber");
            entity.Property(e => e.LotSize).HasColumnName("lotSize");
            entity.Property(e => e.LetterCode).HasColumnName("letterCode");
            entity.Property(e => e.SampleSize).HasColumnName("sampleSize");
            entity.Property(e => e.InspectionLevel).HasColumnName("inspectionLevel");
            entity.Property(e => e.InspectionCode).HasColumnName("inspectionCode");
            entity.Property(e => e.InspectionCodeLabel).HasColumnName("inspectionCodeLabel");
            entity.Property(e => e.InspectionTypeLabel).HasColumnName("inspectionTypeLabel");
            entity.Property(e => e.PlanCriticalAc).HasColumnName("planCriticalAc");
            entity.Property(e => e.PlanCriticalRe).HasColumnName("planCriticalRe");
            entity.Property(e => e.PlanMajorAc).HasColumnName("planMajorAc");
            entity.Property(e => e.PlanMajorRe).HasColumnName("planMajorRe");
            entity.Property(e => e.PlanMinorAc).HasColumnName("planMinorAc");
            entity.Property(e => e.PlanMinorRe).HasColumnName("planMinorRe");
            entity.Property(e => e.Decision).HasColumnName("decision");
            entity.Property(e => e.DecisionReason).HasColumnName("decisionReason");
            entity.Property(e => e.DefectCritical).HasColumnName("defectCritical");
            entity.Property(e => e.DefectMajor).HasColumnName("defectMajor");
            entity.Property(e => e.DefectMinor).HasColumnName("defectMinor");
            entity.Property(e => e.CreatedById).HasColumnName("createdById");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp(3) without time zone")
                .HasColumnName("createdAt");

            entity.HasIndex(e => e.CreatedAt).HasDatabaseName("sampling_histories_createdAt_idx");

            entity.HasOne(d => d.CreatedBy)
                .WithMany()
                .HasForeignKey(d => d.CreatedById)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("sampling_histories_createdById_fkey");
        });
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
