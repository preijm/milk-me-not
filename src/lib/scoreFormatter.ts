// Helper function to format scores consistently
export const formatScore = (score: number): string => {
  // If the score is a whole number, display without decimal
  if (score % 1 === 0) {
    return score.toString();
  }
  // Otherwise, display with one decimal place
  return score.toFixed(1);
};
