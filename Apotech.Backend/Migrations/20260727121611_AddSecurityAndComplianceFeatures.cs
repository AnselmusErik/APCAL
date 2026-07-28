using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apotech.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSecurityAndComplianceFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "failedAttemptCount",
                table: "users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "isLocked",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "lockoutEnd",
                table: "users",
                type: "timestamp(3) without time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    userId = table.Column<string>(type: "text", nullable: true),
                    userEmail = table.Column<string>(type: "text", nullable: true),
                    action = table.Column<string>(type: "text", nullable: false),
                    ipAddress = table.Column<string>(type: "text", nullable: true),
                    details = table.Column<string>(type: "text", nullable: true),
                    createdAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("audit_logs_pkey", x => x.id);
                    table.ForeignKey(
                        name: "audit_logs_userId_fkey",
                        column: x => x.userId,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "system_time_configs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    ntpServer = table.Column<string>(type: "text", nullable: false),
                    syncIntervalSeconds = table.Column<int>(type: "integer", nullable: false),
                    maxDriftThresholdMs = table.Column<int>(type: "integer", nullable: false),
                    timeZone = table.Column<string>(type: "text", nullable: false),
                    updatedById = table.Column<string>(type: "text", nullable: true),
                    updatedAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("system_time_configs_pkey", x => x.id);
                    table.ForeignKey(
                        name: "system_time_configs_updatedById_fkey",
                        column: x => x.updatedById,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "time_sync_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    ntpServer = table.Column<string>(type: "text", nullable: false),
                    offsetMs = table.Column<double>(type: "double precision", nullable: false),
                    roundTripMs = table.Column<double>(type: "double precision", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    details = table.Column<string>(type: "text", nullable: true),
                    checkedAt = table.Column<DateTime>(type: "timestamp(3) without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("time_sync_logs_pkey", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_userId",
                table: "audit_logs",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_system_time_configs_updatedById",
                table: "system_time_configs",
                column: "updatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "system_time_configs");

            migrationBuilder.DropTable(
                name: "time_sync_logs");

            migrationBuilder.DropColumn(
                name: "failedAttemptCount",
                table: "users");

            migrationBuilder.DropColumn(
                name: "isLocked",
                table: "users");

            migrationBuilder.DropColumn(
                name: "lockoutEnd",
                table: "users");
        }
    }
}
