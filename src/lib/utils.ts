import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// deliberate failure to prove the ruleset blocks a red PR
const rulesetGateProbe = 1;
