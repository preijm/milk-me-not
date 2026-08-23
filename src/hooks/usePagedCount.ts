import { useState } from "react";

/**
 * A "show a screenful at a time" counter that starts over when the query behind
 * the list changes.
 *
 * The Results board and the Feed both had this as an effect whose body called
 * setVisibleCount. That works, but it resets a render late: the list re-renders
 * once showing the new results against the old count, then again with the count
 * reset. Comparing during render collapses that into a single pass, and is the
 * pattern React documents for adjusting state when props change.
 *
 * `resetOn` is compared item by item with Object.is, which matches how an effect
 * dependency array behaves — both call sites pass values that are stable between
 * renders, so a changed entry means the query genuinely moved.
 */
export function usePagedCount(pageSize: number, resetOn: readonly unknown[]) {
  const [count, setCount] = useState(pageSize);
  const [seen, setSeen] = useState(resetOn);

  const changed =
    seen.length !== resetOn.length ||
    resetOn.some((value, i) => !Object.is(value, seen[i]));

  if (changed) {
    setSeen(resetOn);
    setCount(pageSize);
  }

  // React discards this render and re-runs when state is set during it, but
  // returning the reset value keeps the returned count honest either way.
  return [changed ? pageSize : count, setCount] as const;
}
