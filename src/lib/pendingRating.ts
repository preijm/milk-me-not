/**
 * Hand-off for a rating that was started before the visitor was signed in.
 *
 * Someone scanning a shelf QR code already knows the product — they should not
 * lose it to a sign-up detour. The deep link parks the product here, auth runs
 * its normal course, and the rating form picks it back up on arrival.
 */

const KEY = "mmn.pendingRating";

/** Long enough to sign up and confirm an email, short enough not to haunt a later visit. */
const TTL_MS = 45 * 60 * 1000;

export type PendingRating = {
  productId: string;
  brandId: string;
  /** For the "you're rating X" line while the visitor is signing in. */
  label?: string;
};

type Stored = PendingRating & { savedAt: number };

export const setPendingRating = (pending: PendingRating): void => {
  try {
    const payload: Stored = { ...pending, savedAt: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Private browsing or a full quota — the visitor just picks the product manually.
  }
};

const read = (): Stored | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.productId || !parsed?.brandId) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const peekPendingRating = (): PendingRating | null => read();

/** Read it once and clear it, so a later visit to the form starts empty. */
export const takePendingRating = (): PendingRating | null => {
  const stored = read();
  if (stored) {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Nothing to do; the TTL will retire it.
    }
  }
  return stored;
};

export const clearPendingRating = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
};
