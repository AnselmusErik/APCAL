"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { InactivityWarningModal } from "../components/auth/InactivityWarningModal";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes total
const WARNING_THRESHOLD_MS = 14 * 60 * 1000;  // Show warning at 14 minutes (60s countdown)
const STORAGE_KEY = "apotech_last_activity";
const CHANNEL_NAME = "apotech_session_channel";

interface InactivityContextType {
  resetTimer: () => void;
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined);

export function InactivityProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, refreshSession } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const clearAllTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  const handleLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    
    // Notify other tabs
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: "LOGOUT" });
      } catch {
        // ignore
      }
    }

    await logout();
  }, [logout]);

  const updateLastActivity = useCallback((publishToStorage = true) => {
    const now = Date.now();
    lastActivityRef.current = now;

    if (publishToStorage && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, now.toString());
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    
    updateLastActivity(true);
    setShowWarning(false);
    setSecondsRemaining(60);
    clearAllTimers();

    // Broadcast EXTEND to other tabs
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ type: "EXTEND" });
      } catch {
        // ignore
      }
    }

    // Ping backend to refresh session timestamp
    refreshSession().catch(() => {});
  }, [isAuthenticated, updateLastActivity, refreshSession]);

  // Setup BroadcastChannel and localStorage listeners for Multi-Tab Sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          clearAllTimers();
          setShowWarning(false);
          logout();
        } else if (event.data?.type === "EXTEND") {
          updateLastActivity(false);
          setShowWarning(false);
          setSecondsRemaining(60);
        }
      };
    } catch {
      // Fallback if BroadcastChannel not supported in browser
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const remoteActivity = parseInt(e.newValue, 10);
        if (!isNaN(remoteActivity)) {
          lastActivityRef.current = remoteActivity;
          setShowWarning(false);
          setSecondsRemaining(60);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [logout, updateLastActivity]);

  // User event listeners (mousemove, keydown, click, scroll, touchstart)
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    let lastThrottledTime = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle event updates to once per 2 seconds to avoid performance overhead
      if (now - lastThrottledTime > 2000) {
        lastThrottledTime = now;
        if (!showWarning) {
          updateLastActivity(true);
        }
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, [isAuthenticated, showWarning, updateLastActivity]);

  // Check Inactivity Loop (runs every 5 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        // Exceeded 15 minutes -> log out immediately
        handleLogout();
      } else if (elapsed >= WARNING_THRESHOLD_MS && !showWarning) {
        // Exceeded 14 minutes -> trigger 60s warning modal
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated, showWarning, handleLogout]);

  // Countdown Timer when warning modal is active
  useEffect(() => {
    if (!showWarning) {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showWarning, handleLogout]);

  return (
    <InactivityContext.Provider value={{ resetTimer }}>
      {children}
      <InactivityWarningModal
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onExtend={resetTimer}
        onLogout={handleLogout}
      />
    </InactivityContext.Provider>
  );
}

export function useInactivity() {
  const context = useContext(InactivityContext);
  if (context === undefined) {
    throw new Error("useInactivity must be used within an InactivityProvider");
  }
  return context;
}
