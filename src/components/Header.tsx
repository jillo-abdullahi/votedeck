import React from "react";
import { Link } from "@tanstack/react-router";

interface HeaderProps {
    children?: React.ReactNode;
    subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ children, subtitle }) => {
    return (
        <header className="w-full border-b border-transparent">
            <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full border-b-2 border-blue-500/30">
                <Link
                    to="/"
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
                >
                    {/* Brand Logo Icon */}
                    <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg shadow-blue-500/20 group-hover:rotate-0 transition-transform duration-300">
                        <span className="font-bold text-2xl text-white">V</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
                            VoteDeck
                        </span>
                        {subtitle && (
                            <span className="text-xs font-medium text-slate-500 truncate max-w-[180px] sm:max-w-xs">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </Link>

                <div className="flex items-center gap-4">{children}</div>
            </nav>
        </header>
    );
};
