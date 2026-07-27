"use client";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getCookie("accessToken");
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Attempt refresh?
    // Since we handle refresh in AuthProvider on initial load, doing it mid-flight is more complex with native fetch.
    // We can attempt a refresh request here.
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshRes.ok) {
      // Retry original request
      const newToken = getCookie("accessToken");
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        return fetch(url, { ...options, headers });
      }
    } else {
      // Redirect to login or let AuthProvider handle it
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return response;
}
