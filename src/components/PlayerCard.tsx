import React from 'react';
import type { User, VoteValue } from '../types';

interface PlayerCardProps {
    user: User;
    vote: VoteValue | null;
    revealed: boolean;
    size?: 'md' | 'sm' | 'xs';
}

const SIZE_CLASSES = {
    md: {
        card: "w-10 h-12 sm:w-16 sm:h-20",
        voteText: "text-lg",
        nameText: "text-sm max-w-[80px]",
        rounded: "rounded-lg sm:rounded-xl",
        width: "w-[80px]"
    },
    sm: {
        card: "w-8 h-10 sm:w-14 sm:h-16",
        voteText: "text-base",
        nameText: "text-xs max-w-[70px]",
        rounded: "rounded-md sm:rounded-lg",
        width: "w-[70px]"
    },
    xs: {
        card: "w-7 h-9 sm:w-10 sm:h-12",
        voteText: "text-sm",
        nameText: "text-[10px] max-w-[60px]",
        rounded: "rounded-sm sm:rounded-md",
        width: "w-[60px]"
    }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ user, vote, revealed, size = 'md' }) => {
    const hasVoted = user.hasVoted;
    const styles = SIZE_CLASSES[size];

    return (
        <div className={`flex flex-col items-center gap-1 ${styles.width}`}>
            <div className={`relative ${styles.card}`} style={{ perspective: '1000px' }}>
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
                            absolute inset-0 flex items-center justify-center ${styles.rounded} border transition-all duration-300
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
                            className={`absolute inset-0 flex items-center justify-center ${styles.rounded} border bg-white border-white`}
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <span className={`${styles.voteText} font-bold text-slate-900`}>{vote}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <span className={`${styles.nameText} font-medium truncate text-center ${hasVoted ? 'text-white' : 'text-slate-500'}`}>
                    {user.name}
                </span>
            </div>
        </div>
    );
};
