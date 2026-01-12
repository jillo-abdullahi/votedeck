import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { VoteValue, VotingSystemId } from "../types";

interface VotingDeckProps {
    selectedValue: VoteValue | null;
    onVote: (val: VoteValue) => void;
    revealed: boolean;
    votingSystem: VotingSystemId;
    children?: React.ReactNode;
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
    children,
}) => {
    const cards = SYSTEM_CARDS[votingSystem] || SYSTEM_CARDS.fibonacci;

    return (
        <AnimatePresence mode="popLayout">
            {revealed ? (
                <motion.div
                    layout
                    key="summary"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center py-4 w-full"
                >
                    {children}
                </motion.div>
            ) : (
                <motion.div
                    layout
                    key="cards"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-wrap justify-center gap-3 py-2"
                >
                    {cards.map((value) => {
                        const isSelected = selectedValue === value;
                        const isDisabled = revealed;

                        return (
                            <button
                                key={value}
                                onClick={() => !isDisabled && onVote(value)}
                                disabled={isDisabled}
                                className={`
              relative flex items-center justify-center cursor-pointer sm:w-14 sm:h-20 w-10 h-14 rounded-lg border-2 sm:text-xl text-lg font-bold transition-all duration-200
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};
