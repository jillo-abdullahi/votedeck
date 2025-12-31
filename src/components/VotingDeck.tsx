import React from "react";
import type { VoteValue, VotingSystemId } from "../types";
import { RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface VotingDeckProps {
    selectedValue: VoteValue | null;
    onVote: (val: VoteValue) => void;
    revealed: boolean;
    votingSystem: VotingSystemId;
    onReset?: () => void;
    canReset?: boolean;
}

const SYSTEM_CARDS: Record<VotingSystemId, VoteValue[]> = {
    fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "?", "☕"],
    modified_fibonacci: ["0", "½", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?", "☕"],
    powers_2: ["0", "1", "2", "4", "8", "16", "32", "64", "?", "☕"],
    tshirts: ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"],
};

export const VotingDeck: React.FC<VotingDeckProps> = ({
    selectedValue,
    onVote,
    revealed,
    votingSystem,
    onReset,
    canReset = true,
}) => {
    if (revealed) {
        return (
            <div className="flex flex-col items-center justify-center py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Button
                    onClick={onReset}
                    disabled={!canReset}
                    size={'lg'}
                    className="group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    Start New Vote
                </Button>
                {!canReset && (
                    <p className="text-slate-500 text-xs mt-2 italic">
                        Only the administrator can start a new vote
                    </p>
                )}
            </div>
        );
    }

    const cards = SYSTEM_CARDS[votingSystem] || SYSTEM_CARDS.fibonacci;

    return (
        <div className="flex flex-wrap justify-center gap-3 py-2">
            {cards.map((value) => {
                const isSelected = selectedValue === value;
                const isDisabled = revealed;

                return (
                    <button
                        key={value}
                        onClick={() => !isDisabled && onVote(value)}
                        disabled={isDisabled}
                        className={`
              relative flex items-center justify-center cursor-pointer w-14 h-20 rounded-lg border-2 text-xl font-bold transition-all duration-200
              ${isSelected
                                ? "bg-blue-600/80 border-blue-500 text-white -translate-y-3"
                                : isDisabled
                                    ? "bg-slate-800/50 border-slate-800 text-slate-600 cursor-not-allowed"
                                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:-translate-y-1 hover:border-slate-500 hover:text-white"
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
