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

export type TshirtSize = "XS" | "S" | "M" | "L" | "XL";

const TSHIRT_ORDER: TshirtSize[] = ["XS", "S", "M", "L", "XL"];

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


