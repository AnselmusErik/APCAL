using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apotech.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:ContainerType", "WADAH,KANTONG,BAK,MB")
                .Annotation("Npgsql:Enum:InspectionGeneralLevel", "I,II,III")
                .Annotation("Npgsql:Enum:UnitType", "TABLET,KAPLET,KAPSUL,SOFT_KAPSUL,VIAL,AMPUL,BLISTER,STRIP,BOTOL,KAFT");

            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updatedAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("permissions_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updatedAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("roles_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: true),
                    email = table.Column<string>(type: "text", nullable: false),
                    emailVerified = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: true),
                    image = table.Column<string>(type: "text", nullable: true),
                    password = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updatedAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("users_pkey", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "verification_tokens",
                columns: table => new
                {
                    identifier = table.Column<string>(type: "text", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    expires = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "role_permissions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    roleId = table.Column<string>(type: "text", nullable: false),
                    permissionId = table.Column<string>(type: "text", nullable: false),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("role_permissions_pkey", x => x.id);
                    table.ForeignKey(
                        name: "role_permissions_permissionId_fkey",
                        column: x => x.permissionId,
                        principalTable: "permissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "role_permissions_roleId_fkey",
                        column: x => x.roleId,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "accounts",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    userId = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    provider = table.Column<string>(type: "text", nullable: false),
                    providerAccountId = table.Column<string>(type: "text", nullable: false),
                    refresh_token = table.Column<string>(type: "text", nullable: true),
                    access_token = table.Column<string>(type: "text", nullable: true),
                    expires_at = table.Column<int>(type: "integer", nullable: true),
                    token_type = table.Column<string>(type: "text", nullable: true),
                    scope = table.Column<string>(type: "text", nullable: true),
                    id_token = table.Column<string>(type: "text", nullable: true),
                    session_state = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("accounts_pkey", x => x.id);
                    table.ForeignKey(
                        name: "accounts_userId_fkey",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "problem_verifications",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    productCode = table.Column<string>(type: "text", nullable: false),
                    batchNumber = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    aqlCriteria = table.Column<string>(type: "text", nullable: false),
                    sampleSize = table.Column<int>(type: "integer", nullable: false),
                    keterangan = table.Column<string>(type: "text", nullable: true),
                    kesimpulan = table.Column<string>(type: "text", nullable: true),
                    createdById = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    updatedAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false),
                    unitType = table.Column<int>(type: "integer", nullable: false),
                    generalLevel = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("problem_verifications_pkey", x => x.id);
                    table.ForeignKey(
                        name: "problem_verifications_createdById_fkey",
                        column: x => x.createdById,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "sampling_histories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    productName = table.Column<string>(type: "text", nullable: true),
                    batchNumber = table.Column<string>(type: "text", nullable: true),
                    lotSize = table.Column<int>(type: "integer", nullable: false),
                    letterCode = table.Column<string>(type: "text", nullable: false),
                    sampleSize = table.Column<int>(type: "integer", nullable: false),
                    inspectionLevel = table.Column<string>(type: "text", nullable: false),
                    inspectionCode = table.Column<string>(type: "text", nullable: false),
                    inspectionCodeLabel = table.Column<string>(type: "text", nullable: false),
                    inspectionTypeLabel = table.Column<string>(type: "text", nullable: false),
                    planCriticalAc = table.Column<int>(type: "integer", nullable: false),
                    planCriticalRe = table.Column<int>(type: "integer", nullable: false),
                    planMajorAc = table.Column<int>(type: "integer", nullable: false),
                    planMajorRe = table.Column<int>(type: "integer", nullable: false),
                    planMinorAc = table.Column<int>(type: "integer", nullable: false),
                    planMinorRe = table.Column<int>(type: "integer", nullable: false),
                    decision = table.Column<string>(type: "text", nullable: true),
                    decisionReason = table.Column<string>(type: "text", nullable: true),
                    defectCritical = table.Column<int>(type: "integer", nullable: false),
                    defectMajor = table.Column<int>(type: "integer", nullable: false),
                    defectMinor = table.Column<int>(type: "integer", nullable: false),
                    createdById = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("sampling_histories_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sampling_histories_createdById_fkey",
                        column: x => x.createdById,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "sessions",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    sessionToken = table.Column<string>(type: "text", nullable: false),
                    userId = table.Column<string>(type: "text", nullable: false),
                    expires = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("sessions_pkey", x => x.id);
                    table.ForeignKey(
                        name: "sessions_userId_fkey",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    userId = table.Column<string>(type: "text", nullable: false),
                    roleId = table.Column<string>(type: "text", nullable: false),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("user_roles_pkey", x => x.id);
                    table.ForeignKey(
                        name: "user_roles_roleId_fkey",
                        column: x => x.roleId,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "user_roles_userId_fkey",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "problem_findings",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    verificationId = table.Column<string>(type: "text", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    findingCount = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    containerType = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("problem_findings_pkey", x => x.id);
                    table.ForeignKey(
                        name: "problem_findings_verificationId_fkey",
                        column: x => x.verificationId,
                        principalTable: "problem_verifications",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "accounts_provider_providerAccountId_key",
                table: "accounts",
                columns: new[] { "provider", "providerAccountId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_accounts_userId",
                table: "accounts",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "permissions_name_key",
                table: "permissions",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "problem_findings_verificationId_position_key",
                table: "problem_findings",
                columns: new[] { "verificationId", "position" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_problem_verifications_createdById",
                table: "problem_verifications",
                column: "createdById");

            migrationBuilder.CreateIndex(
                name: "problem_verifications_batchNumber_idx",
                table: "problem_verifications",
                column: "batchNumber");

            migrationBuilder.CreateIndex(
                name: "problem_verifications_date_idx",
                table: "problem_verifications",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "IX_role_permissions_permissionId",
                table: "role_permissions",
                column: "permissionId");

            migrationBuilder.CreateIndex(
                name: "role_permissions_roleId_permissionId_key",
                table: "role_permissions",
                columns: new[] { "roleId", "permissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "roles_name_key",
                table: "roles",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sampling_histories_createdById",
                table: "sampling_histories",
                column: "createdById");

            migrationBuilder.CreateIndex(
                name: "sampling_histories_createdAt_idx",
                table: "sampling_histories",
                column: "createdAt");

            migrationBuilder.CreateIndex(
                name: "IX_sessions_userId",
                table: "sessions",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "sessions_sessionToken_key",
                table: "sessions",
                column: "sessionToken",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_roles_roleId",
                table: "user_roles",
                column: "roleId");

            migrationBuilder.CreateIndex(
                name: "user_roles_userId_roleId_key",
                table: "user_roles",
                columns: new[] { "userId", "roleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "users_email_key",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "verification_tokens_identifier_token_key",
                table: "verification_tokens",
                columns: new[] { "identifier", "token" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "verification_tokens_token_key",
                table: "verification_tokens",
                column: "token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounts");

            migrationBuilder.DropTable(
                name: "problem_findings");

            migrationBuilder.DropTable(
                name: "role_permissions");

            migrationBuilder.DropTable(
                name: "sampling_histories");

            migrationBuilder.DropTable(
                name: "sessions");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "verification_tokens");

            migrationBuilder.DropTable(
                name: "problem_verifications");

            migrationBuilder.DropTable(
                name: "permissions");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
