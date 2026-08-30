/**
 * Initials for a brand with no logo. "Oddly Good" is OG, "Auchan" is AU.
 *
 * Capitalised words win, so "Take it Veggie" is TV rather than TI — the
 * connector is not part of how anyone says the name.
 *
 * Kept out of the component file for the reason `userMarkTone.ts` is: fast
 * refresh wants a component module to export only components. It also lets the
 * rule be tested as a rule.
 *
 * That second half matters more than it sounds. This used to be tested through
 * `BrandMark`, which renders a logo when the brand has one and initials when it
 * does not — so every fixture doubled as an assertion that the brand had no
 * logo file, and adding one turned the test red somewhere else entirely. It
 * happened with `dmBio`, and again the day "Oddly Good" and "Take it Veggie"
 * got logos, which is the very pair the doc comment above uses as examples.
 */
export const brandInitials = (brand: string | null | undefined) => {
  const words = (brand ?? "").trim().split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (words.length === 0) return "?";
  const named = words.filter((w) => w[0] === w[0].toUpperCase());
  const pick = named.length >= 2 ? named : words;
  if (pick.length >= 2) return (pick[0][0] + pick[1][0]).toUpperCase();
  return pick[0].slice(0, 2).toUpperCase();
};
