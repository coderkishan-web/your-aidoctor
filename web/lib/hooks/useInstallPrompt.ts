"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

class InstallStore {
  public event: BeforeInstallPromptEvent | null = null;
  private listeners: Set<() => void> = new Set();

  setEvent(e: BeforeInstallPromptEvent | null) {
    this.event = e;
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  async prompt() {
    if (!this.event) return false;
    try {
      await this.event.prompt();
      const choice = await this.event.userChoice;
      if (choice.outcome === "accepted") {
        this.setEvent(null);
        return true;
      }
    } catch {}
    return false;
  }
}

export const installStore = new InstallStore();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installStore.setEvent(e as BeforeInstallPromptEvent);
  });
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(!!installStore.event);

  useEffect(() => {
    return installStore.subscribe(() => {
      setCanInstall(!!installStore.event);
    });
  }, []);

  const promptInstall = useCallback(() => {
    return installStore.prompt();
  }, []);

  return { canInstall, promptInstall };
}
