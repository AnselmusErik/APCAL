"use client";

import React from "react";
import { AlertTriangle, Clock, LogOut, RefreshCw } from "lucide-react";

interface InactivityWarningModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function InactivityWarningModal({
  isOpen,
  secondsRemaining,
  onExtend,
  onLogout,
}: InactivityWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/30 dark:border-amber-500/20 shadow-2xl p-6 text-zinc-900 dark:text-zinc-100 space-y-6">
        
        {/* Header Icon */}
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Session Timeout Warning
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              GAMP 5 Inactivity Protection
            </p>
          </div>
        </div>

        {/* Message & Timer Countdown */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-4 space-y-3">
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            You have been inactive. For compliance and enterprise security, your session will automatically terminate in:
          </p>

          <div className="flex items-center justify-center space-x-2 py-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-wider">
              {secondsRemaining}s
            </span>
          </div>

          <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
            Click <strong>Extend Session</strong> to continue working without interruption.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onExtend}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md hover:shadow-emerald-600/20 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Extend Session
          </button>
          
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-sm transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
