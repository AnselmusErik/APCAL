"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BackofficeLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      ...form,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Access denied");
      setLoading(false);
      return;
    }

    router.push("/backoffice/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="text-xl font-bold mb-6">Backoffice</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="Admin email"
          />
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
