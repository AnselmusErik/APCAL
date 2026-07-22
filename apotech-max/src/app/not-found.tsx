import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <p className="text-xl text-white/60 mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
