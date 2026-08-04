"use client";

import { useEffect, useState, useRef } from "react";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

const DISMISS_KEY = "medora_install_dismissed";
const IDLE_TIMEOUT_MS = 60000; // 1 minute

/**
 * PWA install prompt. Shows after 1 minute of idle time.
 * Dismissed state persisted in localStorage. Skips if already installed.
 */
export function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;
    
    // Only start tracking idle time if the app is installable
    if (!canInstall) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setVisible(true);
      }, IDLE_TIMEOUT_MS);
    };

    // Initial timer start
    resetIdleTimer();

    // Listeners for user activity
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
    };
  }, [canInstall]);

  const install = async () => {
    const success = await promptInstall();
    if (success) {
      localStorage.setItem(DISMISS_KEY, "1");
    }
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible || !canInstall) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-16 md:bottom-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-surface-1 border border-line/60 shadow-card backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink-base">Install YourAIDoctor</p>
          <p className="text-xs text-ink-muted mt-0.5">Add to home screen for instant access. Free, private.</p>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={install} className="px-3 py-1.5 rounded-lg bg-brand-gradient text-white text-xs font-bold hover:brightness-110">
              Install
            </button>
            <button onClick={dismiss} className="px-3 py-1.5 rounded-lg text-ink-muted text-xs font-semibold hover:text-ink-base">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="flex-shrink-0 text-ink-subtle hover:text-ink-base">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

