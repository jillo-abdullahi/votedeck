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

export type TshirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

const TSHIRT_ORDER: TshirtSize[] = ["XS", "S", "M", "L", "XL", "XXL"];

export function calculateTshirtConsensus(votes: string[]): {
  consensus: TshirtSize | null;
  counts: Record<TshirtSize, number>;
  totalValidVotes: number;
} {
  // 1. Filter valid T-shirt votes
  const validVotes = votes.filter(
    (v): v is TshirtSize => TSHIRT_ORDER.includes(v as TshirtSize)
  );

  if (validVotes.length === 0) {
    return {
      consensus: null,
      counts: {
        XS: 0,
        S: 0,
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
      },
      totalValidVotes: 0,
    };
  }

  // 2. Count votes
  const counts = TSHIRT_ORDER.reduce((acc, size) => {
    acc[size] = 0;
    return acc;
  }, {} as Record<TshirtSize, number>);

  for (const vote of validVotes) {
    counts[vote]++;
  }

  // 3. Check for mode
  const maxCount = Math.max(...Object.values(counts));
  const modes = TSHIRT_ORDER.filter(size => counts[size] === maxCount);

  if (modes.length === 1) {
    return {
      consensus: modes[0],
      counts,
      totalValidVotes: validVotes.length,
    };
  }

  // 4. Median fallback (bias upward)
  const sortedVotes = [...validVotes].sort(
    (a, b) => TSHIRT_ORDER.indexOf(a) - TSHIRT_ORDER.indexOf(b)
  );

  const middleIndex = Math.floor(sortedVotes.length / 2);
  const consensus = sortedVotes[middleIndex];

  return {
    consensus,
    counts,
    totalValidVotes: validVotes.length,
  };
}

/**
 * Calculates the most popular vote(s) from a list of votes.
 * - If all votes are unique, returns null.
 * - If there is a clear winner, returns it.
 * - If there is a tie, returns the HIGHEST value (Numeric or T-Shirt size).
 */
export function getMostPopularVote(votes: string[]): string | null {
  if (votes.length === 0) return null;

  const counts: Record<string, number> = {};
  votes.forEach((v) => {
    counts[v] = (counts[v] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(counts));

  // If max count is 1, it means all votes are unique -> return null
  if (maxCount === 1) return null;

  // Find all votes that have the max count
  const winners = Object.keys(counts).filter((v) => counts[v] === maxCount);

  if (winners.length === 1) return winners[0];

  // Tie-breaking: Highest Value Wins

  // Check if T-shirt sizes
  const isTshirt = winners.every((w) => TSHIRT_ORDER.includes(w as any));

  if (isTshirt) {
    // Sort by index in TSHIRT_ORDER descending (highest index = largest size)
    winners.sort((a, b) => {
      const idxA = TSHIRT_ORDER.indexOf(a as any);
      const idxB = TSHIRT_ORDER.indexOf(b as any);
      return idxB - idxA;
    });
    return winners[0];
  }

  // Numeric handling
  const getNumericValue = (v: string): number => {
    if (v === "½") return 0.5;
    const parsed = parseFloat(v);
    return isNaN(parsed) ? -Infinity : parsed;
  };

  winners.sort((a, b) => {
    const valA = getNumericValue(a);
    const valB = getNumericValue(b);

    if (valA !== -Infinity && valB !== -Infinity) {
      return valB - valA; // Descending
    }
    // Fallback to string comparison
    if (a > b) return -1;
    if (a < b) return 1;
    return 0;
  });

  return winners[0];
}


