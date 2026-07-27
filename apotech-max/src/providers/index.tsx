"use client";

import { AuthProvider } from "./AuthProvider";
import { InactivityProvider } from "./InactivityProvider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <InactivityProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0a0a0a",
              border: "1px solid rgba(0,0,0,0.10)",
            },
            success: {
              iconTheme: { primary: "#00c896", secondary: "#ffffff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            },
          }}
        />
      </InactivityProvider>
    </AuthProvider>
  );
}
