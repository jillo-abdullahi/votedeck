import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Calculates the agreement level based on consensus.
 * Ensures:
 * - All unique votes = 0%
 * - All same votes = 100%
 */
export function calculateAgreement(
  counts: number[],
  totalVoters: number
): number {
  if (totalVoters <= 1) return 100;

  const maxVotes = Math.max(...counts);

  // No two people agree
  if (maxVotes === 1) return 0;

  return Math.round((maxVotes / totalVoters) * 100);
}


