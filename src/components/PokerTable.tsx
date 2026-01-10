import React, { useMemo } from 'react';
import type { User, VoteValue } from '../types';
import { PlayerCard } from './PlayerCard';

interface PokerTableProps {
    users: User[];
    votes: Record<string, VoteValue | null>;
    revealed: boolean;
    children: React.ReactNode;
    overlay?: React.ReactNode;
}

export const PokerTable: React.FC<PokerTableProps> = ({ users, votes, revealed, children, overlay }) => {
    // Distribute users into Top, Right, Bottom, Left positions for the table layout
    const { top, right, bottom, left } = useMemo(() => {
        const count = users.length;
        if (count === 0) return { top: [], right: [], bottom: [], left: [] };

        // For small number of users, keep it simple (Top/Bottom only)
        if (count <= 4) {
            const half = Math.ceil(count / 2);
            return {
                top: users.slice(0, half),
                bottom: users.slice(half),
                left: [],
                right: []
            };
        }

        // For larger groups, distribute around the table
        // Aim for roughly 30% top/bottom, 20% sides
        const sideCount = Math.floor(count * 0.2) || 1;
        const remaining = count - (sideCount * 2);
        const topCount = Math.ceil(remaining / 2);

        let cursor = 0;
        const topUsers = users.slice(cursor, cursor + topCount);
        cursor += topCount;

        const rightUsers = users.slice(cursor, cursor + sideCount);
        cursor += sideCount;

        const bottomUsers = users.slice(cursor, cursor + (remaining - topCount));
        cursor += (remaining - topCount);

        const leftUsers = users.slice(cursor);

        return {
            top: topUsers,
            right: rightUsers,
            bottom: bottomUsers,
            left: leftUsers
        };
    }, [users]);

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto gap-4 p-1">

            {/* Top Row */}
            <div className="flex justify-center gap-4 w-full min-h-[60px]">
                {top.map(user => (
                    <PlayerCard
                        key={user.id}
                        user={user}
                        vote={votes[user.id] || null}
                        revealed={revealed}
                    />
                ))}
            </div>

            <div className="flex items-center justify-center w-full gap-4">
                {/* Left Column */}
                <div className="flex flex-col justify-center gap-4 min-w-[60px]">
                    {left.map(user => (
                        <PlayerCard
                            key={user.id}
                            user={user}
                            vote={votes[user.id] || null}
                            revealed={revealed}
                        />
                    ))}
                </div>

                {/* The Table (Active Area) */}
                <div className="flex-1 rounded-[2rem] bg-slate-800/50 border-2 border-slate-700 relative h-[140px] flex items-center justify-center p-4 shadow-xl overflow-hidden">
                    <div className="absolute inset-0 rounded-[1.8rem] border border-slate-600/30 pointer-events-none" />
                    {children}
                    {overlay}
                </div>

                {/* Right Column */}
                <div className="flex flex-col justify-center gap-4 min-w-[60px]">
                    {right.map(user => (
                        <PlayerCard
                            key={user.id}
                            user={user}
                            vote={votes[user.id] || null}
                            revealed={revealed}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-center gap-4 w-full min-h-[60px]">
                {bottom.map(user => (
                    <PlayerCard
                        key={user.id}
                        user={user}
                        vote={votes[user.id] || null}
                        revealed={revealed}
                    />
                ))}
            </div>
        </div>
    );
};
