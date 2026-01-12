import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Target, BarChart3 } from 'lucide-react';
import type { VotingSystemId } from '../types';
import { calculateAgreement, calculateTshirtConsensus } from '../lib/utils';

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
    <div className={`min-w-0 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-4 relative overflow-hidden group hover:border-slate-600/50 transition-colors ${className}`}>
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
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

        // 1. Calculate Average or Consensus
        let average: number | null = null;
        let consensus: string | null = null;

        if (votingSystem === 'tshirts') {
            const result = calculateTshirtConsensus(activeVotes);
            consensus = result.consensus;
        } else {
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
        const agreement = calculateAgreement(Object.values(counts), allCastedVotes.length);

        return {
            average: average !== null ? (average % 1 === 0 ? average.toString() : Math.round(average)) : null,
            consensus,
            sortedCounts,
            agreement,
            totalVoters: allCastedVotes.length
        };
    }, [votes, votingSystem]);

    if (!stats) return null;

    const getAgreementColors = (agreement: number) => {
        if (agreement > 75) {
            return {
                border: "border-emerald-500/50",
                bg: "bg-emerald-500/20",
                barBorder: "border-emerald-500/50",
                text: "text-emerald-400",
                textDim: "text-emerald-400/80"
            };
        }
        if (agreement >= 35) {
            return {
                border: "border-yellow-500/50",
                bg: "bg-yellow-500/20",
                barBorder: "border-yellow-500/50",
                text: "text-yellow-400",
                textDim: "text-yellow-400/80"
            };
        }
        return {
            border: "border-red-500/50",
            bg: "bg-red-500/20",
            barBorder: "border-red-500/50",
            text: "text-red-400",
            textDim: "text-red-400/80"
        };
    };

    const colors = getAgreementColors(stats.agreement);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full flex flex-col md:flex-row items-stretch justify-center gap-4 px-4 h-full"
                >
                    {/* Average/Consensus Box - Takes less space */}
                    <SummaryBox
                        title={votingSystem === 'tshirts' ? "Consensus" : "Average"}
                        icon={<Target className="w-3 h-3 text-blue-500" />}
                        className="flex-[0.8]"
                    >
                        {stats.consensus ? (
                            <div className="text-3xl sm:text-5xl font-black text-white">
                                {stats.consensus}
                            </div>
                        ) : stats.average !== null ? (
                            <div className="text-3xl sm:text-5xl font-black text-white">
                                {stats.average}
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-slate-600">N/A</div>
                        )}
                    </SummaryBox>

                    {/* Distribution Box - Takes more space */}
                    <SummaryBox
                        title={`${stats.totalVoters} ${stats.totalVoters === 1 ? 'Vote' : 'Votes'}`}
                        icon={<BarChart3 className="w-3 h-3 text-purple-500" />}
                        className="flex-[1.2]"
                    >
                        <div className="flex gap-2 flex-wrap justify-center max-h-[80px] overflow-y-auto px-1 custom-scrollbar w-full">
                            {stats.sortedCounts.map(([val, count]) => (
                                <div
                                    key={val}
                                    className="bg-slate-900/40 border border-slate-700/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-2 shadow-sm"
                                >
                                    <span className="font-bold text-blue-400 text-md border-r border-slate-700/50 pr-2">{val}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{count} {count === 1 ? 'vote' : 'votes'}</span>
                                </div>
                            ))}
                        </div>
                    </SummaryBox>

                    {/* Agreement Box - Takes more space */}
                    <SummaryBox
                        title="Agreement"
                        icon={<Users className="w-3 h-3 text-emerald-500" />}
                        className="flex-[1.5]"
                    >
                        <div className="w-full flex items-center gap-4 py-2 px-1">
                            <div className="flex-1 flex flex-col gap-2">
                                <div className={`relative h-8 sm:h-12 w-full bg-slate-900/50 rounded-lg sm:rounded-xl border overflow-hidden group ${colors.border}`}>
                                    {/* Fill Bar */}
                                    {stats.agreement > 0 && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.agreement}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            className={`absolute left-0 top-0 h-full ${colors.bg} ${stats.agreement === 100 ? 'w-full' : `border-r ${colors.barBorder}`}`}
                                        />
                                    )}

                                    {/* Labels Layer */}
                                    <div className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-semibold tracking-wide uppercase ${colors.text}`}>Agreed</span>
                                            <span className={`text-sm font-semibold ${colors.textDim}`}>{stats.agreement}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SummaryBox>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
