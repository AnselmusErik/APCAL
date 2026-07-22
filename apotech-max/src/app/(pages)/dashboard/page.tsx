import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/60 mb-8">Welcome back, {session.user?.name ?? session.user?.email}</p>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ANSI Calculator Card */}
          <Link
            href="/ansi"
            className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📊</span>
              <h2 className="text-xl font-semibold">ANSI/AQL Calculator</h2>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Kalkulator sampling plan dan evaluasi cacat untuk QA Line Injeksi
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">PT Dankos Farma</span>
              <span className="text-cyan-400 text-sm">Open →</span>
            </div>
          </Link>

          {/* Profile Card */}
          <Link
            href="/profile"
            className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">👤</span>
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Manage your account and preferences
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">Account</span>
              <span className="text-cyan-400 text-sm">Manage →</span>
            </div>
          </Link>

          {/* Admin Panel Card (if user is admin) */}
          {session.user?.roles?.includes('ADMIN') && (
            <Link
              href="/backoffice"
              className="glass rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">⚙️</span>
                <h2 className="text-xl font-semibold">Admin Panel</h2>
              </div>
              <p className="text-white/60 text-sm mb-4">
                System administration and user management
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Admin only</span>
                <span className="text-cyan-400 text-sm">Access →</span>
              </div>
            </Link>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Recent Activity</h2>
          <div className="glass rounded-2xl p-6">
            <p className="text-white/60">No recent activity to display</p>
          </div>
        </div>
      </div>
    </main>
  );
}
