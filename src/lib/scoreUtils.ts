// Helper functions for score-based styling

type ScoreBadgeVariant = "scoreBadgeExcellent" | "scoreBadgeGood" | "scoreBadgeFair" | "scoreBadgePoor";
type ScoreVariant = "scoreExcellent" | "scoreGood" | "scoreFair" | "scorePoor";

export const getScoreBadgeVariant = (rating: number): ScoreBadgeVariant => {
  if (rating >= 8.5) return "scoreBadgeExcellent";
  if (rating >= 7.5) return "scoreBadgeGood";
  if (rating >= 5.5) return "scoreBadgeFair";
  return "scoreBadgePoor";
};

export const getScoreVariant = (rating: number): ScoreVariant => {
  if (rating >= 8.5) return "scoreExcellent";
  if (rating >= 7.5) return "scoreGood";
  if (rating >= 5.5) return "scoreFair";
  return "scorePoor";
};