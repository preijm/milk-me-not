/**
 * Whether the visitor has asked their system to reduce motion.
 *
 * `story.css` already neutralises CSS animations for these users, but it can
 * only reach declarative animation — anything driven from JavaScript, like a
 * map that rotates itself or a counter that ticks up, has to check this and
 * opt out on its own.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
