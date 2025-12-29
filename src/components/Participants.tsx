import React from 'react';
import type { User, VoteValue } from '../types';

interface ParticipantsProps {
    users: User[];
    votes: Record<string, VoteValue | null>;
    revealed: boolean;
}

export const Participants: React.FC<ParticipantsProps> = ({ users, votes, revealed }) => {
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
                            ) : (
                                hasVoted && (
                                    <span className="text-white text-3xl font-bold">✓</span>
                                )
                            )}
                        </div>

                        <span className={`text-sm font-medium ${hasVoted ? 'text-white' : 'text-slate-500'}`}>
                            {user.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
