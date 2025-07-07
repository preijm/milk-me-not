// Helper functions for score-based styling

type ScoreBadgeVariant = "scoreBadgeExcellent" | "scoreBadgeGood" | "scoreBadgeFair" | "scoreBadgePoor";
type ScoreVariant = "scoreExcellent" | "scoreGood" | "scoreFair" | "scorePoor";
type CircularScoreVariant = "circularScoreExcellent" | "circularScoreGood" | "circularScoreFair" | "circularScorePoor";

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

export const getCircularScoreVariant = (rating: number): CircularScoreVariant => {
  if (rating >= 8.5) return "circularScoreExcellent";
  if (rating >= 7.5) return "circularScoreGood";
  if (rating >= 5.5) return "circularScoreFair";
  return "circularScorePoor";
};