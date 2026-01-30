// Helper functions for score-based styling

type ScoreBadgeVariant = "scoreBadgeExcellent" | "scoreBadgeGood" | "scoreBadgeFair" | "scoreBadgePoor";

export const getScoreBadgeVariant = (rating: number): ScoreBadgeVariant => {
  if (rating >= 8.5) return "scoreBadgeExcellent";
  if (rating >= 7.5) return "scoreBadgeGood";
  if (rating >= 5.5) return "scoreBadgeFair";
  return "scoreBadgePoor";
};
