import React, { useRef } from 'react';
import type { User, VoteValue } from '../types';
import { UserPlusIcon, type UserPlusHandle } from './icons/UserPlusIcon';
import { UserAvatar } from './UserAvatar';

interface ParticipantsProps {
    users: User[];
    votes: Record<string, VoteValue | null>;
    revealed: boolean;
    onInvite?: () => void;
}

export const Participants: React.FC<ParticipantsProps> = ({ users, votes, revealed, onInvite }) => {
    const userPlusRef = useRef<UserPlusHandle>(null);

    return (
        <div className="flex flex-wrap justify-center gap-8 py-8">
            {users.map((user) => {
                const hasVoted = user.hasVoted;
                const voteValue = votes[user.id];

                return (
                    <div key={user.id} className="flex flex-col items-center gap-3">
                        <div className="relative w-16 h-20" style={{ perspective: '1000px' }}>
                            <div
                                className={`
                                    relative w-full h-full transition-all duration-700
                                    ${revealed && hasVoted ? '-translate-y-2' : ''}
                                `}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: revealed && hasVoted ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                }}
                            >
                                {/* Card Back (voted state) */}
                                <div
                                    className={`
                                        absolute inset-0 flex items-center justify-center rounded-xl border-2 transition-all duration-300
                                        ${hasVoted
                                            ? 'border-slate-600 shadow-lg shadow-slate-900/40'
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
                                                    #1e3a8a 10px,
                                                    #2563eb 10px,
                                                    #2563eb 20px
                                                ),
                                                repeating-linear-gradient(
                                                    -45deg,
                                                    #1e3a8a 0px,
                                                    #1e3a8a 10px,
                                                    #2563eb 10px,
                                                    #2563eb 20px
                                                )
                                            `,
                                            backgroundBlendMode: 'multiply'
                                        } : {})
                                    }}
                                >
                                    {!hasVoted && <UserAvatar name={user.name} size={36} />}
                                </div>

                                {/* Card Front (revealed state) */}
                                {hasVoted && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center rounded-xl border-2 bg-white border-white"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                        }}
                                    >
                                        <span className="text-2xl font-bold text-slate-900">{voteValue}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <span className={`text-sm font-medium truncate max-w-[80px] text-center ${hasVoted ? 'text-white' : 'text-slate-500'}`}>
                            {user.name}
                        </span>
                    </div>
                );
            })}

            {/* Invite Placeholder */}
            {onInvite && (
                <button
                    onClick={onInvite}
                    onMouseEnter={() => userPlusRef.current?.startAnimation()}
                    onMouseLeave={() => userPlusRef.current?.stopAnimation()}
                    className="flex flex-col items-center gap-3 group cursor-pointer"
                >
                    <div className="flex items-center justify-center w-16 h-20 rounded-xl border-2 border-dashed border-slate-700 bg-transparent hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300">
                        <UserPlusIcon
                            className="text-slate-600 group-hover:text-slate-400 transition-colors"
                            size={24}
                            ref={userPlusRef}
                        />
                    </div>
                </button>
            )}
        </div>
    );
};
