import { describe, it, expect } from "vitest";
import { getScoreBadgeVariant } from "./scoreUtils";

describe("scoreUtils", () => {
  describe("getScoreBadgeVariant", () => {
    it("returns scoreBadgeExcellent for ratings >= 8.5", () => {
      expect(getScoreBadgeVariant(8.5)).toBe("scoreBadgeExcellent");
      expect(getScoreBadgeVariant(9)).toBe("scoreBadgeExcellent");
      expect(getScoreBadgeVariant(10)).toBe("scoreBadgeExcellent");
    });

    it("returns scoreBadgeGood for ratings >= 7.5 and < 8.5", () => {
      expect(getScoreBadgeVariant(7.5)).toBe("scoreBadgeGood");
      expect(getScoreBadgeVariant(8)).toBe("scoreBadgeGood");
      expect(getScoreBadgeVariant(8.4)).toBe("scoreBadgeGood");
    });

    it("returns scoreBadgeFair for ratings >= 5.5 and < 7.5", () => {
      expect(getScoreBadgeVariant(5.5)).toBe("scoreBadgeFair");
      expect(getScoreBadgeVariant(6)).toBe("scoreBadgeFair");
      expect(getScoreBadgeVariant(7.4)).toBe("scoreBadgeFair");
    });

    it("returns scoreBadgePoor for ratings < 5.5", () => {
      expect(getScoreBadgeVariant(0)).toBe("scoreBadgePoor");
      expect(getScoreBadgeVariant(3)).toBe("scoreBadgePoor");
      expect(getScoreBadgeVariant(5.4)).toBe("scoreBadgePoor");
    });
  });
});
