/**
 * Normalizes a name by trimming whitespace and collapsing multiple spaces.
 */
export const normalizeName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Calculates a simple similarity score between two strings (0 to 1).
 * Uses a combination of lowercase comparison, common prefix, and character overlap.
 */
export const similarityScore = (a: string, b: string): number => {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();

  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;

  // Levenshtein distance
  const longer = na.length >= nb.length ? na : nb;
  const shorter = na.length < nb.length ? na : nb;

  if (longer.length === 0) return 1;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

/**
 * Returns true if two names are similar above a given threshold.
 * Default threshold is 0.75 (75% similar).
 */
export const isSimilar = (a: string, b: string, threshold = 0.75): boolean => {
  return similarityScore(a, b) >= threshold;
};

/**
 * Finds the best matching entry from a list, returning it if above the threshold.
 */
export const findClosestMatch = <T extends { name: string }>(
  input: string,
  items: T[],
  threshold = 0.75
): T | null => {
  if (!input.trim()) return null;

  let bestMatch: T | null = null;
  let bestScore = 0;

  for (const item of items) {
    const score = similarityScore(input, item.name);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
};

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
