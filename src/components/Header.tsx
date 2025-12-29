import React, { type PropsWithChildren } from "react";
import { Link } from "@tanstack/react-router";

export const Header: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <header className="w-full border-b border-transparent">
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full border-b-2 border-blue-500/30">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          {/* Simple Logo Icon */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3">
            <span className="font-bold text-lg text-white">V</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            VoteDeck
          </span>
        </Link>

        <div className="flex items-center gap-4">{children}</div>
      </nav>
    </header>
  );
};
