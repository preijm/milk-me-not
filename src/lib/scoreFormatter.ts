// Helper function to format scores consistently
export const formatScore = (score: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (score === undefined || score === null || isNaN(score)) {
    return "0.0";
  }
  // Always display with one decimal place
  return score.toFixed(1);
};
