import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Participants } from '../components/Participants';
import { VotingDeck } from '../components/VotingDeck';
import { Controls } from '../components/Controls';
import { mockRoom } from '../mock/room';
import type { RoomState, VoteValue } from '../types';

// Simulating "Me" as user 1 for this demo
const MY_USER_ID = "1";

export const RoomPage: React.FC = () => {
    const [room, setRoom] = useState<RoomState>(mockRoom);
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
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
            <Header roomId={room.roomId} />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">

                {/* Participants Section */}
                <section aria-label="Participants" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Participants
                        users={room.users}
                        votes={room.votes}
                        revealed={room.revealed}
                    />
                </section>

                {/* Voting Deck Section */}
                <section aria-label="Voting Deck" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <VotingDeck
                        selectedValue={myVote}
                        onVote={handleVote}
                        revealed={room.revealed}
                    />
                </section>

                {/* Controls Section */}
                <section aria-label="Controls" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <Controls
                        revealed={room.revealed}
                        onReveal={handleReveal}
                        onReset={handleReset}
                        canReveal={canReveal}
                    />
                </section>

            </main>
        </div>
    );
};
