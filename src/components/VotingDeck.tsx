import React from "react";
import type { VoteValue } from "../types";

interface VotingDeckProps {
  selectedValue: VoteValue | null;
  onVote: (val: VoteValue) => void;
  revealed: boolean;
}

const CARDS: VoteValue[] = ["1", "2", "3", "5", "8", "13", "?"];

export const VotingDeck: React.FC<VotingDeckProps> = ({
  selectedValue,
  onVote,
  revealed,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-2">
      {CARDS.map((value) => {
        const isSelected = selectedValue === value;
        const isDisabled = revealed;

        return (
          <button
            key={value}
            onClick={() => !isDisabled && onVote(value)}
            disabled={isDisabled}
            className={`
              relative flex items-center justify-center w-14 h-20 rounded-lg border-2 text-xl font-bold transition-all duration-200
              ${
                isSelected
                  ? "bg-blue-600 border-blue-500 text-white -translate-y-3 shadow-lg shadow-blue-500/30"
                  : isDisabled
                  ? "bg-slate-800/50 border-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-500 hover:text-white hover:shadow"
              }
            `}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
};
