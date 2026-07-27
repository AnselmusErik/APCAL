"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { KeyRound, Lock, LogIn, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "admin@dankos.com", password: "admin123" });

  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error("Mohon isi username dan password");
      return;
    }

    setLoading(true);

    try {
      await login({
        email: form.username,
        password: form.password,
      });

      toast.success("Login berhasil! Selamat datang di APCAL");
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat login");
      setLoading(false);
    }
  }

  const fillDemoAccount = () => {
    setForm({ username: "admin@dankos.com", password: "admin123" });
    toast.success("Kredensial demo terisi!");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[color:var(--color-bg-base)] via-[color:var(--color-bg-subtle)] to-[color:var(--color-primary-tint)]">
      <div className="w-full max-w-md bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-2xl rounded-2xl p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[color:var(--color-primary)]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] shadow-xs">
            <Image
              src="/brand/logo-dankos.webp"
              alt="Logo Dankos Farma"
              width={140}
              height={45}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-fg)]">
              APCAL Sign In
            </h1>
            <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
              ANSI/ASQ Z1.4 Pharma Quality Assurance Calculator
            </p>
          </div>
        </div>

        {/* Demo Hint Banner */}
        <div className="p-3 rounded-xl border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary-tint)] flex items-center justify-between text-xs">
          <div className="space-y-0.5 text-[color:var(--color-fg-muted)]">
            <span className="font-semibold text-[color:var(--color-primary)] block">Kredensial Default:</span>
            <span>User: <code className="font-mono text-[color:var(--color-fg)]">admin@dankos.com</code></span>
            <span className="mx-1">·</span>
            <span>Pass: <code className="font-mono text-[color:var(--color-fg)]">admin123</code></span>
          </div>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-[10px] px-2.5 py-1 rounded-md bg-[color:var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity shrink-0 ml-2"
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[color:var(--color-fg)] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
              Username / Email QA
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-xl bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] px-4 py-2.5 text-sm text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all"
              placeholder="admin@dankos.com atau admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[color:var(--color-fg)] flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[color:var(--color-primary)]" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] pl-4 pr-10 py-2.5 text-sm text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-[color:var(--color-primary)] py-3 px-4 text-sm font-semibold text-white hover:bg-[color:var(--color-primary)]/90 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Masuk Sistem QA</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[color:var(--color-border)] text-center">
          <p className="text-[11px] text-[color:var(--color-fg-subtle)] flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-success)]" />
            PT Dankos Farma — Quality Assurance Division &copy; 2026
          </p>
        </div>
      </div>
    </main>
  );
}
