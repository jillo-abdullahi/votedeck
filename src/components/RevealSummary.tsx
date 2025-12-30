import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, BarChart3 } from 'lucide-react';
import type { VotingSystemId } from '../types';

interface RevealSummaryProps {
    votes: Record<string, string | null>;
    votingSystem: VotingSystemId;
    isVisible: boolean;
}

interface SummaryBoxProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    headerExtra?: React.ReactNode;
    className?: string;
}

const SummaryBox: React.FC<SummaryBoxProps> = ({ title, icon, children, headerExtra, className = "" }) => (
    <div className={`min-w-0 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-600/50 transition-colors ${className}`}>
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                <div className="p-1 px-1.5 bg-slate-900/50 rounded-md border border-slate-700/50">
                    {icon}
                </div>
                {title}
            </div>
            {headerExtra}
        </div>
        <div className="flex-1 flex items-center justify-center">
            {children}
        </div>
    </div>
);

export const RevealSummary: React.FC<RevealSummaryProps> = ({ votes, votingSystem, isVisible }) => {
    const stats = useMemo(() => {
        const activeVotes = Object.values(votes).filter((v): v is string => v !== null && v !== "" && v !== "?" && v !== "☕");
        const allCastedVotes = Object.values(votes).filter((v): v is string => v !== null && v !== "");

        if (allCastedVotes.length === 0) return null;

        // 1. Calculate Average (only for numeric-ish systems)
        let average: number | null = null;
        if (votingSystem !== 'tshirts') {
            const sum = activeVotes.reduce((acc, v) => {
                const val = v === "½" ? 0.5 : parseFloat(v);
                return isNaN(val) ? acc : acc + val;
            }, 0);
            average = activeVotes.length > 0 ? sum / activeVotes.length : null;
        }

        // 2. Summary of points & counts
        const counts: Record<string, number> = {};
        allCastedVotes.forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
        });

        const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        // 3. Agreement Level
        const mostCommonCount = sortedCounts[0]?.[1] || 0;
        // We use (max - 1) / (total - 1) so that:
        // - All unique votes = 0% agreement
        // - All same votes = 100% agreement
        let agreement = 0;
        if (allCastedVotes.length > 1) {
            agreement = ((mostCommonCount - 1) / (allCastedVotes.length - 1)) * 100;
        } else if (allCastedVotes.length === 1) {
            agreement = 100;
        }

        // 4. Agreement Emoji
        const getAgreementEmoji = (pct: number) => {
            if (pct >= 100) return "🥳";
            if (pct >= 80) return "😊";
            if (pct >= 50) return "🤔";
            if (pct >= 30) return "🤨";
            return "😱";
        };

        return {
            average: average !== null ? (average % 1 === 0 ? average.toString() : Math.round(average)) : null,
            sortedCounts,
            agreement: Math.round(agreement),
            totalVoters: allCastedVotes.length,
            emoji: getAgreementEmoji(Math.round(agreement))
        };
    }, [votes, votingSystem]);

    if (!stats) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full flex flex-col md:flex-row items-stretch justify-center gap-4 py-4 px-6 h-full"
                >
                    {/* Average Box - Takes less space */}
                    <SummaryBox
                        title="Average"
                        icon={<Target className="w-3 h-3 text-blue-500" />}
                        className="flex-[0.8]"
                    >
                        {stats.average !== null ? (
                            <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                {stats.average}
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-slate-600">N/A</div>
                        )}
                    </SummaryBox>

                    {/* Distribution Box - Takes more space */}
                    <SummaryBox
                        title="Votes"
                        icon={<BarChart3 className="w-3 h-3 text-purple-500" />}
                        className="flex-[1.2]"
                    >
                        <div className="flex gap-2 flex-wrap justify-center max-h-[80px] overflow-y-auto px-1 custom-scrollbar w-full">
                            {stats.sortedCounts.map(([val, count]) => (
                                <div
                                    key={val}
                                    className="bg-slate-900/40 border border-slate-700/50 px-2.5 py-1 rounded-lg flex items-center gap-2 shadow-sm"
                                >
                                    <span className="font-bold text-blue-400 text-sm">{val}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{count} {count === 1 ? 'vote' : 'votes'}</span>
                                </div>
                            ))}
                        </div>
                    </SummaryBox>

                    {/* Agreement Box - Takes more space */}
                    <SummaryBox
                        title="Agreement"
                        icon={<Users className="w-3 h-3 text-emerald-500" />}
                        className="flex-[1.2]"
                        headerExtra={
                            <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {stats.agreement}%
                            </div>
                        }
                    >
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* SVG Ring */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="transparent"
                                    className="text-slate-900/50"
                                />
                                <motion.circle
                                    initial={{ strokeDashoffset: 251.2 }}
                                    animate={{ strokeDashoffset: 251.2 - (251.2 * stats.agreement) / 100 }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    strokeDasharray="251.2"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    className="text-emerald-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-3xl">
                                    {stats.emoji}
                                </div>
                            </div>
                        </div>
                    </SummaryBox>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
