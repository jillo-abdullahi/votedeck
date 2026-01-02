import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { userManager } from "@/lib/user";
import { UserMenu } from "@/components/UserMenu";
import { LoginModal } from "@/components/modals/LoginModal";

export const LandingPage: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const token = userManager.getAccessToken();
        const name = userManager.getUserName();
        if (token && name) {
            setUserName(name);
        }
    }, []);

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
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500/30">
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
                <Link
                    to="/create"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ml-4"
                >
                    Start new game
                </Link>
            </Header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
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
                            className="text-5xl sm:text-6xl font-extrabold leading-tight text-left"
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
                        <Link
                            to="/create"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 block text-center"
                        >
                            Start new game
                        </Link>
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
                            className="relative bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]"
                        >
                            {/* Window Controls */}
                            <div className="flex gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>

                            {/* Content Mock */}
                            <div className="flex flex-col gap-8 items-center">
                                {/* Mock Participants */}
                                <div className="flex gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-16 rounded bg-slate-700 animate-pulse" />
                                            <div className="w-8 h-2 rounded bg-slate-600" />
                                        </div>
                                    ))}
                                </div>

                                {/* Mock Table/Deck */}
                                <div className="w-full h-32 bg-slate-700/30 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700 text-slate-500 text-sm">
                                    VoteDeck Active Area
                                </div>

                                {/* Mock Cards Hand */}
                                <div className="flex gap-2">
                                    {[1, 2, 3, 5, 8].map((n) => (
                                        <div
                                            key={n}
                                            className="w-10 h-14 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm"
                                        >
                                            {n}
                                        </div>
                                    ))}
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
        </div>
    );
};
