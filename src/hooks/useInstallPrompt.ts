import { useCallback, useEffect, useState } from "react";
import { useVersion } from "@/contexts/VersionContext";
import { installMode, isDismissed, rememberDismissal, type InstallMode } from "@/lib/installPrompt";

/** Chrome's event; not in the DOM typings. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    // iOS Safari's own flag for a home-screen launch.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt(): {
  mode: InstallMode;
  install: () => Promise<void>;
  dismiss: () => void;
} {
  const { showUpdateNotice, isNative } = useVersion();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(isDismissed);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      // Keep Chrome's own mini-infobar from competing with the banner; the
      // saved event lets the Install button open the real dialog later.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    rememberDismissal();
    setDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    // The event can be used once; Chrome sends a fresh one if it is still
    // installable later.
    setDeferred(null);
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "dismissed") dismiss();
  }, [deferred, dismiss]);

  const mode = installMode({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    standalone: installed || isStandalone(),
    native: isNative,
    updateShowing: showUpdateNotice,
    dismissed,
    hasDeferredPrompt: deferred !== null,
  });

  return { mode, install, dismiss };
}
