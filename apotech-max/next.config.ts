import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/ansi/:path*',
        destination: 'http://localhost:5075/api/ansi/:path*' // Proxy to .NET Backend
      },
      {
        source: '/api/verification/:path*',
        destination: 'http://localhost:5075/api/verification/:path*' // Proxy to .NET Backend
      },
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:5075/api/users/:path*' // Proxy to .NET Backend
      }
    ];
  }
};

export default nextConfig;
