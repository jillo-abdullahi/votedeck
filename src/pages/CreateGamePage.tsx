import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { DisplayNameModal } from "../components/DisplayNameModal";
import { Header } from "../components/Header";
import { Button } from "@/components/ui/button";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";

// Voting systems options
const VOTING_SYSTEMS = [
  {
    id: "fibonacci",
    label: "Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕ )",
  },
  {
    id: "modified_fibonacci",
    label: "Modified Fibonacci ( 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕ )",
  },
  { id: "tshirts", label: "T-shirts ( XS, S, M, L, XL, ?, ☕ )" },
  { id: "powers_2", label: "Powers of 2 ( 0, 1, 2, 4, 8, 16, 32, 64, ?, ☕ )" },
];

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");
  const [votingSystem, setVotingSystem] = useState(VOTING_SYSTEMS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const moveRightIconRef = useRef<MoveRightIconHandle>(null);

  // Triggered when form is valid and user clicks "Create Game"
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameName.trim()) {
      setIsModalOpen(true);
    }
  };

  // Triggered when user submits name in modal
  const handleFinalSubmit = (displayName: string) => {
    // Generate a random 6-character room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Interact with router to navigate
    navigate({
      to: "/room/$roomId",
      params: { roomId: newRoomId },
      search: { name: displayName },
    });
  };

  const selectedSystemLabel = VOTING_SYSTEMS.find(
    (s) => s.id === votingSystem
  )?.label;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col selection:bg-blue-500/30">
      <DisplayNameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFinalSubmit}
      />

      <Header>
        <div className="font-bold text-slate-300">Create new game</div>
      </Header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 pb-20">
        <form
          onSubmit={handleInitialSubmit}
          className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <div className="space-y-8">
            {/* Game Name Input */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-start">
                <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">
                  Game Name
                </label>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. Sprint 32 Planning"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-4 px-6 text-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg"
                  required
                  autoFocus
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Custom Voting System Dropdown */}
            <div className="space-y-2 relative z-20 flex flex-col">
              <div className="flex items-center justify-start">
                <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider">
                  Voting System
                </label>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-4 px-6 text-left text-lg text-white hover:border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg flex items-center justify-between group"
                >
                  <span className="truncate pr-8">{selectedSystemLabel}</span>
                  <div
                    className={`text-slate-500 transition-transform duration-200 group-hover:text-slate-400 ${isDropdownOpen ? "rotate-180" : ""
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-50">
                    {VOTING_SYSTEMS.map((sys) => (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => {
                          setVotingSystem(sys.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 hover:bg-slate-700 transition-colors flex items-center border-b border-slate-700 last:border-0 ${votingSystem === sys.id
                          ? "bg-blue-600/10 text-blue-400 font-medium"
                          : "text-slate-300"
                          }`}
                      >
                        {sys.label}
                        {votingSystem === sys.id && (
                          <span className="ml-auto text-blue-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Backdrop to close dropdown */}
                {isDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                    aria-label="Close dropdown"
                  />
                )}
              </div>
            </div>
          </div>

          {/* CTA Button - Relocated closer to inputs */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              onMouseEnter={() => moveRightIconRef.current?.startAnimation()}
              onMouseLeave={() => moveRightIconRef.current?.stopAnimation()}
            >
              <span>Create Game</span>
              <MoveRightIcon ref={moveRightIconRef} />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
