import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5075/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Login failed' }, { status: response.status });
    }

    // Set HttpOnly cookies for access token and refresh token
    const res = NextResponse.json(data);
    
    // Access token (used by middleware and client API wrapper)
    // Actually, middleware needs to read it. Client needs to send it to API.
    // If HttpOnly, client fetch can't read it to attach to Bearer header for direct API calls.
    // Wait, if it's HttpOnly, we proxy all API requests? No, the user said:
    // "Every API request should automatically include Authorization header. Example: Authorization: Bearer <token>"
    // So the client needs to access it. So we don't make the accessToken HttpOnly.
    // Or we store accessToken in AuthProvider state, and only HttpOnly the refreshToken.
    // Let's store accessToken in regular cookie (so middleware can read it, and JS can read it for API).
    // Let's store refreshToken in HttpOnly cookie.

    res.cookies.set('accessToken', data.token, {
      httpOnly: false, // JS needs to read it to attach to API headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    res.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true, // Secure, JS cannot access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
