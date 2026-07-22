"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApiMutation } from "@/hooks/useApiMutation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const { mutate, loading } = useApiMutation("/api/auth/register", "POST", {
    successMessage: "Account created! Please sign in.",
    onSuccess: () => router.push("/login"),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await mutate(form);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-white/50 text-sm mb-8">Get started for free</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/70">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Your name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/70">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/70">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
