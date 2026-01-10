import { motion } from "motion/react";
import { Settings, LogOut, RefreshCcw, Target, Layers, Users } from "lucide-react";
import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { useGetAuthMe } from "@/lib/api/generated";
import { UserMenu } from "@/components/UserMenu";
import { LoginModal } from "@/components/modals/LoginModal";
import { JoinRoomModal } from "@/components/modals/JoinRoomModal";
import { Button } from "@/components/ui/button";

export const LandingPage: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    const { data: userData } = useGetAuthMe({
        query: {
            retry: false,
            staleTime: Infinity,
        }
    });

    useEffect(() => {
        if (userData?.name) {
            setUserName(userData.name);
        }
    }, [userData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut" as const
            }
        }
    };

    return (
        <PageLayout className="bg-transparent">
            <Header>
                {userName ? (
                    <UserMenu name={userName} onNameChange={setUserName} />
                ) : (
                    <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="hidden cursor-pointer sm:block text-slate-300 hover:text-white font-medium text-sm transition-colors"
                    >
                        Sign in
                    </button>
                )}
                <Button
                    asChild
                >
                    <Link
                        to="/create"
                    >
                        Start new game
                    </Link>
                </Button>
            </Header>

            {/* Hero Section */}
            <main className="w-full p-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center"
            >
                {/* Left Content */}
                <motion.div
                    className="flex flex-col gap-8 max-w-xl"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="space-y-4">
                        <motion.h1
                            variants={itemVariants}
                            className="text-3xl sm:text-5xl font-extrabold leading-tight text-left"
                        >
                            Scrum Poker for <br />
                            <span className="text-blue-500">agile teams</span>
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-slate-400 max-w-md text-left"
                        >
                            Streamline your estimation process with a tool capable of running
                            your synchronous and asynchronous planning poker sessions.
                        </motion.p>
                    </div>

                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Button
                            asChild
                            size="lg"
                        >
                            <Link
                                to="/create"
                            >
                                Start new game
                            </Link>

                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setIsJoinModalOpen(true)}
                        >
                            Join a game
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Right Content - Visual */}
                <div className="relative">
                    {/* Decorative Elements */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.3, 0.2]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"
                    />

                    {/* Card Component Mock Application UI */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: 1 }}
                        animate={{ opacity: 1, scale: 1, rotate: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative bg-slate-900 rounded-3xl border border-slate-800 p-8 transform transition-transform duration-500 hover:scale-[1.02]"
                        >
                            {/* Mock Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <span className="text-[10px] font-bold">P</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-200">Sprint 46 planning</span>
                                    <span className="text-[10px] text-slate-500 hidden sm:inline-block">| VUGMNA</span>
                                </div>
                                <div className="flex gap-2 text-slate-500">
                                    <Settings size={12} />
                                    <LogOut size={12} />
                                </div>
                            </div>

                            {/* Content Mock */}
                            <div className="flex flex-col gap-2 items-center w-full">
                                {/* Top Participants */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-14 bg-white rounded-lg shadow-lg flex items-center justify-center mb-1">
                                            <span className="text-slate-900 font-bold text-sm">8</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">Stacy</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-14 bg-white rounded-lg shadow-lg flex items-center justify-center mb-1">
                                            <span className="text-slate-900 font-bold text-sm">8</span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">Victor</span>
                                    </div>
                                </div>

                                {/* Central Action */}
                                <div className="w-full rounded-2xl bg-slate-800/30 border-2 border-slate-700 relative h-[80px] flex items-center justify-center p-4">
                                    <div className="bg-blue-600/30 rounded-lg px-4 py-2 flex items-center gap-2">
                                        <RefreshCcw size={12} className="text-white" />
                                        <span className="text-xs font-bold text-white">Start New Vote</span>
                                    </div>
                                </div>

                                {/* Bottom Participant */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-14 bg-white rounded-lg shadow-lg flex items-center justify-center mb-1">
                                        <span className="text-slate-900 font-bold text-sm">3</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">Jimmy</span>
                                </div>

                                {/* Footer Stats */}
                                <div className="grid grid-cols-3 gap-3 w-full mt-2">
                                    {/* Average */}
                                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-1.5 text-blue-400 opacity-80 w-full justify-start">
                                            <Target size={10} />
                                            <span className="text-[8px] font-bold tracking-wider uppercase">Average</span>
                                        </div>
                                        <span className="text-3xl font-bold text-white">6</span>
                                    </div>

                                    {/* Votes Breakdown */}
                                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5 text-purple-400 opacity-80 mb-1">
                                            <Layers size={10} />
                                            <span className="text-[8px] font-bold tracking-wider uppercase">3 Votes</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <div className="flex items-center gap-1">
                                                <span className="bg-blue-500/20 text-blue-300 px-1 rounded font-bold">8</span>
                                                <span className="text-slate-400">2 votes</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <div className="flex items-center gap-1">
                                                <span className="bg-blue-500/20 text-blue-300 px-1 rounded font-bold">3</span>
                                                <span className="text-slate-400">1 vote</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Agreement */}
                                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
                                        <div className="flex items-center gap-1.5 text-green-400 opacity-80">
                                            <Users size={10} />
                                            <span className="text-[8px] font-bold tracking-wider uppercase">Agreement</span>
                                        </div>
                                        <div className="flex-1 flex items-end">
                                            <div className="w-full h-6 rounded-md border border-yellow-500/30 bg-yellow-500/10 relative overflow-hidden flex items-center">
                                                <div className="absolute inset-y-0 left-0 bg-yellow-500/20 w-[67%]" />
                                                <span className="relative z-10 text-[8px] font-bold text-yellow-500 w-full text-center">AGREED 67%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            <JoinRoomModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />
        </PageLayout>
    );
};
