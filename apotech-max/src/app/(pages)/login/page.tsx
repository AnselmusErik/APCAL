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
  const [form, setForm] = useState({ username: "adminQA@dankos.com", password: "Dankos2026" });

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
    setForm({ username: "adminQA@dankos.com", password: "Dankos2026" });
    toast.success("Kredensial demo terisi!");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-pharma-grid bg-[color:var(--color-bg-subtle)] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[color:var(--color-primary)]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-lg rounded-2xl p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
        {/* Brand & Header — Clean logo without bubble box */}
        <div className="text-center space-y-4">
          <Image
            src="/brand/logo-dankos.webp"
            alt="Logo Dankos Farma"
            width={160}
            height={50}
            className="h-12 w-auto object-contain mx-auto"
            priority
          />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--color-fg)]">
              APCAL Sign In
            </h1>
            <p className="text-xs text-[color:var(--color-fg-muted)] mt-1">
              ANSI/ASQ Z1.4 Quality Assurance System
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
              className="w-full rounded-xl bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] px-4 py-2.5 text-sm text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all font-medium"
              placeholder="adminQA@dankos.com"
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
                className="w-full rounded-xl bg-[color:var(--color-bg-subtle)] border border-[color:var(--color-border)] pl-4 pr-10 py-2.5 text-sm text-[color:var(--color-fg)] focus:outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)] transition-colors p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-[color:var(--color-primary)] py-3 px-4 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-hover)] active:bg-[color:var(--color-primary-active)] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
