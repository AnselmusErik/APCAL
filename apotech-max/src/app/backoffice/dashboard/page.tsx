import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";

export default async function BackofficeDashboardPage() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session) redirect("/backoffice/login");

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Backoffice</h1>
      <p className="text-white/60">Logged in as {session.user?.email}</p>
    </main>
  );
}
