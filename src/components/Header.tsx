import React from 'react';
import { Link } from '@tanstack/react-router';

interface HeaderProps {
    roomId: string;
}

export const Header: React.FC<HeaderProps> = ({ roomId }) => {
    return (
        <header className="w-full flex justify-between items-center p-6 lg:px-12 border-b border-slate-800">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                VoteDeck
            </Link>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-sm font-medium">Room</span>
                <code className="text-white font-mono font-bold tracking-wider">{roomId}</code>
            </div>
        </header>
    );
};
