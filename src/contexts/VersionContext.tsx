import React, { createContext, useContext } from "react";
import { useVersionCheck, VersionCheckResult } from "@/hooks/useVersionCheck";

const VersionContext = createContext<VersionCheckResult | null>(null);

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const versionCheck = useVersionCheck();

  return (
    <VersionContext.Provider value={versionCheck}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion(): VersionCheckResult {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error("useVersion must be used within a VersionProvider");
  }
  return context;
}
