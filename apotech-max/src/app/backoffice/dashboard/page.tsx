"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function BackofficeDashboardPage() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <main className="min-h-screen p-8"><p>Loading...</p></main>;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Backoffice</h1>
      <p className="text-white/60">Logged in as {user?.email}</p>
    </main>
  );
}
