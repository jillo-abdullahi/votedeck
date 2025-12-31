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
    <div className={`min-w-0 bg-slate-800/40 border-none rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-600/50 transition-colors ${className}`}>
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

        // 4. Agreement Image
        let agreementImg = "/agree-15.png";
        if (agreement > 75) agreementImg = "/agree-95.png";
        else if (agreement > 50) agreementImg = "/agree-75.png";
        else if (agreement > 35) agreementImg = "/agree-50.png";
        else if (agreement > 15) agreementImg = "/agree-35.png";

        return {
            average: average !== null ? (average % 1 === 0 ? average.toString() : Math.round(average)) : null,
            sortedCounts,
            agreement: Math.round(agreement),
            agreementImg,
            totalVoters: allCastedVotes.length
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
                    className="w-full flex flex-col md:flex-row items-stretch justify-center gap-4 p-4 h-full"
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
                            {/* Agreement Status Image */}
                            <div className="w-12 h-12 rounded-full bg-slate-900/50 border border-blue-500/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                <motion.img
                                    key={stats.agreementImg}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={stats.agreementImg}
                                    alt="Agreement Status"
                                    className="w-full h-full object-contain rounded-full"
                                />
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                <div className="relative h-12 w-full bg-slate-900/50 rounded-xl border border-blue-500/50 overflow-hidden group">
                                    {/* Fill Bar */}
                                    {stats.agreement > 0 && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.agreement}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                            className={`absolute left-0 top-0 h-full bg-blue-500/20  ${stats.agreement === 100 ? 'w-full' : 'border-r border-blue-500/50'}`}
                                        />
                                    )}

                                    {/* Labels Layer */}
                                    <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                        {stats.agreement > 0 && (
                                            <div className={`flex items-center gap-3 ${stats.agreement === 100 ? 'w-full justify-center' : ''}`}>
                                                <span className="text-sm font-semibold text-blue-400 tracking-wide uppercase">Agreed</span>
                                                <span className="text-sm font-semibold text-blue-400/80">{stats.agreement}%</span>
                                            </div>
                                        )}
                                        {stats.agreement < 100 && (
                                            <div className={`flex items-center gap-3 ${stats.agreement === 0 ? 'w-full justify-center' : ''}`}>
                                                <span className="text-sm font-semibold text-slate-500/80">{100 - stats.agreement}%</span>
                                                <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Disagreed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* <p className="text-[10px] text-slate-600 font-medium px-1 flex justify-between italic">
                                    <span>Based on {stats.totalVoters} {stats.totalVoters === 1 ? 'player' : 'players'}</span>
                                    {stats.agreement === 100 && (
                                        <span className="text-blue-500/70 font-bold not-italic">Full Consensus! 🎉</span>
                                    )}
                                </p> */}
                            </div>
                        </div>
                    </SummaryBox>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
