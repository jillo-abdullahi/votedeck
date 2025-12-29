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
                        <div className={`
              flex items-center justify-center w-16 h-20 rounded-xl border-2 transition-all duration-300
              ${revealed && hasVoted
                                ? 'bg-white border-white -translate-y-2'
                                : hasVoted
                                    ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-800 border-slate-700'
                            }
            `}>
                            {revealed && hasVoted ? (
                                <span className="text-2xl font-bold text-slate-900">{voteValue}</span>
                            ) : hasVoted ? (
                                <span className="text-white text-3xl font-bold">✓</span>
                            ) : (
                                <UserAvatar name={user.name} />
                            )}
                        </div>

                        <span className={`text-sm font-medium ${hasVoted ? 'text-white' : 'text-slate-500'}`}>
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
