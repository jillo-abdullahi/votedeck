import React, { useState } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import { Header } from '../components/Header';
import { Participants } from '../components/Participants';
import { VotingDeck } from '../components/VotingDeck';
import { Controls } from '../components/Controls';
import { mockRoom } from '../mock/room';
import type { RoomState, VoteValue } from '../types';

// Simulating "Me" as user 1 for this demo
const MY_USER_ID = "1";

export const RoomPage: React.FC = () => {
    const { roomId } = useParams({ from: '/room/$roomId' });
    const { name } = useSearch({ from: '/room/$roomId' }); // Read query param

    // Initialize room with the provided user name if available
    const [room, setRoom] = useState<RoomState>(() => {
        const initialState = { ...mockRoom, roomId };
        if (name) {
            initialState.users = initialState.users.map(u =>
                u.id === MY_USER_ID ? { ...u, name: name } : u
            );
        }
        return initialState;
    });

    const [myVote, setMyVote] = useState<VoteValue | null>(room.votes[MY_USER_ID] || null);

    const handleVote = (value: VoteValue) => {
        // Determine if we are toggling off
        const newValue = myVote === value ? null : value;
        setMyVote(newValue);

        // Update local optimistic state for UI responsiveness
        setRoom(prev => ({
            ...prev,
            votes: {
                ...prev.votes,
                [MY_USER_ID]: newValue
            },
            users: prev.users.map(u =>
                u.id === MY_USER_ID
                    ? { ...u, hasVoted: newValue !== null }
                    : u
            )
        }));
    };

    const handleReveal = () => {
        setRoom(prev => ({ ...prev, revealed: true }));
    };

    const handleReset = () => {
        setRoom(prev => ({
            ...prev,
            revealed: false,
            votes: {}, // Clear all votes in this mock
            users: prev.users.map(u => ({ ...u, hasVoted: false }))
        }));
        setMyVote(null);
    };

    const canReveal = room.users.some(u => u.hasVoted);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
            <Header>
                <div className="flex items-center gap-4">
                    {name && (
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-slate-400 text-sm">Playing as</span>
                            <span className="text-white font-bold">{name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-slate-400 text-sm font-medium">Room</span>
                        <code className="text-white font-mono font-bold tracking-wider">{room.roomId}</code>
                    </div>
                </div>
            </Header>

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

                {/* 1. Participants Section (Top) */}
                <section aria-label="Participants" className="w-full flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <Participants
                        users={room.users}
                        votes={room.votes}
                        revealed={room.revealed}
                    />
                </section>

                {/* 2. Active Area (Middle) - Fixed Height */}
                <section
                    aria-label="Active Area"
                    className="w-full h-48 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/30 relative animate-in zoom-in-95 duration-700 delay-100"
                >
                    {/* Watermark Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                        <span className="text-slate-700/50 font-bold text-xl sm:text-2xl uppercase tracking-[0.2em]">VoteDeck Active Area</span>
                    </div>

                    {/* Controls (Centered) */}
                    <div className="relative z-10">
                        <Controls
                            revealed={room.revealed}
                            onReveal={handleReveal}
                            onReset={handleReset}
                            canReveal={canReveal}
                        />
                    </div>
                </section>

            </main>

            {/* 3. Voting Deck Section (Sticky Bottom) */}
            <section aria-label="Voting Deck" className="sticky bottom-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-t border-slate-800 pb-4 pt-2 animate-in slide-in-from-bottom-full duration-700 delay-200">
                <div className="max-w-5xl mx-auto px-4">
                    <VotingDeck
                        selectedValue={myVote}
                        onVote={handleVote}
                        revealed={room.revealed}
                    />
                </div>
            </section>
        </div>
    );
};
