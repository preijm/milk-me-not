import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should pass a basic assertion", () => {
    expect(true).toBe(true);
  });

  it("should perform basic math", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle string operations", () => {
    expect("Milk Me Not").toContain("Milk");
  });
});
