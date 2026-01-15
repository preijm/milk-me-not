// App version - should match the version in package.json and app_versions table
export const APP_VERSION = "1.0.0";

// Storage keys
export const VERSION_STORAGE_KEY = "dismissedVersions";

export interface DismissedVersion {
  dismissedAt: string;
  remindAfter: string;
}

export interface DismissedVersions {
  [version: string]: DismissedVersion;
}

/**
 * Compare two semver versions
 * Returns true if latest is newer than current
 */
export function isNewerVersion(current: string, latest: string): boolean {
  const parseVersion = (v: string) => {
    const parts = v.split(".").map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  };

  const cur = parseVersion(current);
  const lat = parseVersion(latest);

  if (lat.major > cur.major) return true;
  if (lat.major === cur.major && lat.minor > cur.minor) return true;
  if (lat.major === cur.major && lat.minor === cur.minor && lat.patch > cur.patch) return true;
  return false;
}

/**
 * Check if a version is a major update compared to current
 */
export function isMajorUpdate(current: string, latest: string): boolean {
  const curMajor = parseInt(current.split(".")[0], 10) || 0;
  const latMajor = parseInt(latest.split(".")[0], 10) || 0;
  return latMajor > curMajor;
}

/**
 * Get dismissed versions from localStorage
 */
export function getDismissedVersions(): DismissedVersions {
  try {
    const stored = localStorage.getItem(VERSION_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Save dismissed version to localStorage
 */
export function dismissVersion(version: string, remindHours: number = 24): void {
  const dismissed = getDismissedVersions();
  const now = new Date();
  const remindAfter = new Date(now.getTime() + remindHours * 60 * 60 * 1000);

  dismissed[version] = {
    dismissedAt: now.toISOString(),
    remindAfter: remindAfter.toISOString(),
  };

  localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(dismissed));
}

/**
 * Check if a version should be shown (not dismissed or remind time passed)
 */
export function shouldShowVersion(version: string): boolean {
  const dismissed = getDismissedVersions();
  const versionData = dismissed[version];

  if (!versionData) return true;

  const remindAfter = new Date(versionData.remindAfter);
  return new Date() >= remindAfter;
}

/**
 * Clear all dismissed versions
 */
export function clearDismissedVersions(): void {
  localStorage.removeItem(VERSION_STORAGE_KEY);
}
