using System;
using System.Net;
using System.Net.Sockets;
using System.Threading.Tasks;
using Apotech.Backend.DTOs;
using Apotech.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Apotech.Backend.Services;

public interface INtpService
{
    Task<ServerTimeResponse> GetServerTimeStatusAsync();
    Task<TimeSyncLog> PerformTimeSyncCheckAsync(string? ntpServerOverride = null);
}

public class NtpService : INtpService
{
    private readonly AppDbContext _context;

    public NtpService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ServerTimeResponse> GetServerTimeStatusAsync()
    {
        var config = await _context.SystemTimeConfigs.FirstOrDefaultAsync(c => c.Id == "default");
        var ntpServer = config?.NtpServer ?? "pool.ntp.org";
        var maxThreshold = config?.MaxDriftThresholdMs ?? 1000;
        var timeZone = config?.TimeZone ?? "UTC";

        var (offsetMs, roundTripMs, success, error) = await QueryNtpServerAsync(ntpServer);

        var isSync = success && Math.Abs(offsetMs) <= maxThreshold;

        return new ServerTimeResponse
        {
            ServerUtcTime = DateTime.UtcNow,
            TimeZone = timeZone,
            NtpServer = ntpServer,
            IsSynchronized = isSync,
            DriftOffsetMs = offsetMs,
            RoundTripMs = roundTripMs,
            LastCheckedAt = DateTime.UtcNow
        };
    }

    public async Task<TimeSyncLog> PerformTimeSyncCheckAsync(string? ntpServerOverride = null)
    {
        var config = await _context.SystemTimeConfigs.FirstOrDefaultAsync(c => c.Id == "default");
        var ntpServer = ntpServerOverride ?? config?.NtpServer ?? "pool.ntp.org";
        var maxThreshold = config?.MaxDriftThresholdMs ?? 1000;

        var (offsetMs, roundTripMs, success, error) = await QueryNtpServerAsync(ntpServer);

        string status;
        string? details;

        if (!success)
        {
            status = "ERROR";
            details = $"NTP query failed: {error}";
        }
        else if (Math.Abs(offsetMs) > maxThreshold)
        {
            status = "WARNING";
            details = $"Time drift ({offsetMs:F2}ms) exceeds threshold ({maxThreshold}ms).";
        }
        else
        {
            status = "OK";
            details = $"Synchronized with NTP. Drift: {offsetMs:F2}ms, RTT: {roundTripMs:F2}ms.";
        }

        var log = new TimeSyncLog
        {
            Id = Guid.NewGuid().ToString("N"),
            NtpServer = ntpServer,
            OffsetMs = offsetMs,
            RoundTripMs = roundTripMs,
            Status = status,
            Details = details,
            CheckedAt = DateTime.UtcNow
        };

        _context.TimeSyncLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    private static async Task<(double offsetMs, double roundTripMs, bool success, string? error)> QueryNtpServerAsync(string ntpServer)
    {
        try
        {
            // NTP Data Structure (48 bytes)
            var ntpData = new byte[48];
            ntpData[0] = 0x1B; // LI = 0 (no warning), VN = 3 (IPv4 only), Mode = 3 (Client)

            var addresses = await Dns.GetHostAddressesAsync(ntpServer);
            if (addresses.Length == 0)
                return (0, 0, false, "Could not resolve NTP server address.");

            var ipEndPoint = new IPEndPoint(addresses[0], 123);

            using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, ProtocolType.Udp);
            socket.ReceiveTimeout = 3000;
            socket.SendTimeout = 3000;

            var t0 = DateTime.UtcNow;
            await socket.ConnectAsync(ipEndPoint);
            await socket.SendAsync(ntpData, SocketFlags.None);
            
            var buffer = new byte[48];
            var bytesRead = await socket.ReceiveAsync(buffer, SocketFlags.None);
            var t3 = DateTime.UtcNow;

            if (bytesRead < 48)
                return (0, 0, false, "Incomplete NTP packet received.");

            // Extract Transmit Timestamp (bytes 40-47)
            ulong intPart = (ulong)buffer[40] << 24 | (ulong)buffer[41] << 16 | (ulong)buffer[42] << 8 | (ulong)buffer[43];
            ulong fractPart = (ulong)buffer[44] << 24 | (ulong)buffer[45] << 16 | (ulong)buffer[46] << 8 | (ulong)buffer[47];

            var milliseconds = (intPart * 1000) + ((fractPart * 1000) / 0x100000000L);
            var ntpTime = new DateTime(1900, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddMilliseconds((long)milliseconds);

            // Estimate offset and RTT
            double roundTrip = (t3 - t0).TotalMilliseconds;
            double offset = (ntpTime - t3).TotalMilliseconds + (roundTrip / 2.0);

            return (offset, roundTrip, true, null);
        }
        catch (Exception ex)
        {
            // Fallback when network/UDP is unreachable or blocked
            return (0, 0, false, ex.Message);
        }
    }
}
