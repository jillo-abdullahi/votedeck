import React from 'react';
import type { User, VoteValue } from '../types';

interface PlayerCardProps {
    user: User;
    vote: VoteValue | null;
    revealed: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ user, vote, revealed }) => {
    const hasVoted = user.hasVoted;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-10 h-12 sm:w-16 sm:h-20" style={{ perspective: '1000px' }}>
                <div
                    className="relative w-full h-full transition-all duration-700"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: revealed && hasVoted ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Card Back (voted state) */}
                    <div
                        className={`
                            absolute inset-0 flex items-center justify-center rounded-lg sm:rounded-xl border transition-all duration-300
                            ${hasVoted
                                ? 'border-slate-600'
                                : 'bg-slate-800 border-slate-700'
                            }
                        `}
                        style={{
                            backfaceVisibility: 'hidden',
                            ...(hasVoted ? {
                                background: `
                                    repeating-linear-gradient(
                                        45deg,
                                        #1e3a8a 0px,
                                        #1e3a8a 5px,
                                        #2563eb 5px,
                                        #2563eb 10px
                                    ),
                                    repeating-linear-gradient(
                                        -45deg,
                                        #1e3a8a 0px,
                                        #1e3a8a 5px,
                                        #2563eb 5px,
                                        #2563eb 10px
                                    )
                                `,
                                backgroundBlendMode: 'multiply'
                            } : {})
                        }}
                    >
                    </div>

                    {/* Card Front (revealed state) */}
                    {hasVoted && (
                        <div
                            className="absolute inset-0 flex items-center justify-center rounded-xl border bg-white border-white"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <span className="text-lg font-bold text-slate-900">{vote}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <span className={`text-sm font-medium truncate max-w-[80px] text-center ${hasVoted ? 'text-white' : 'text-slate-500'}`}>
                    {user.name}
                </span>
            </div>
        </div>
    );
};
