import { motion } from "motion/react";
import React from "react";
import { Link } from "@tanstack/react-router";

interface HeaderProps {
    children?: React.ReactNode;
    subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ children, subtitle }) => {
    return (
        <motion.header
            className="w-full border-b border-transparent"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <nav className="flex items-center justify-between px-2 py-4 max-w-7xl mx-auto w-full border-b-2 border-blue-500/30">
                <Link
                    to="/"
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
                >
                    {/* Brand Logo Icon */}
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        <span className="font-bold text-2xl text-white">V</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
                            VoteDeck
                        </span>
                        {subtitle && (
                            <span className="text-sm font-medium text-slate-500 truncate max-w-[180px] sm:max-w-xs">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </Link>

                <div className="flex items-center gap-4">{children}</div>
            </nav>
        </motion.header>
    );
};
