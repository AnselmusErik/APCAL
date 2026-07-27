import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5075/api';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      await fetch(`${API_BASE_URL}/Auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }

    const res = NextResponse.json({ success: true });
    
    // Clear cookies
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    // Also clear next-auth cookies just in case during migration
    res.cookies.delete('next-auth.session-token');
    res.cookies.delete('next-auth.csrf-token');

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
