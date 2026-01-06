import React, { useState, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useNavigate } from "@tanstack/react-router";
import { DisplayNameModal } from "../components/modals/DisplayNameModal";
import { Header } from "../components/Header";
import { Button } from "@/components/ui/button";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { roomsApi } from "../lib/api";
import type { VotingSystemId } from "../types";
import { userManager } from "../lib/user";
import { ChevronDownIcon, UserIcon, Layers, Loader2, SpadeIcon } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { motion } from "motion/react";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
};

export const CreateGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameName, setGameName] = useState("");
  const [votingSystem, setVotingSystem] = useState(VOTING_SYSTEMS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const moveRightIconRef = useRef<MoveRightIconHandle>(null);

  // Triggered when form is valid and user clicks "Create Game"
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName.trim()) return;

    const existingToken = userManager.getAccessToken();
    const existingName = userManager.getUserName();

    if (existingToken && existingName) {
      handleFinalSubmit(existingName);
    } else {
      setIsModalOpen(true);
    }
  };

  // Triggered when user submits name in modal
  const handleFinalSubmit = async (displayName: string) => {
    setIsCreating(true);
    try {
      // Create the room via backend API - now passing displayName as adminName
      const { roomId, accessToken, userId, recoveryCode } = await roomsApi.createRoom(gameName, votingSystem as VotingSystemId, displayName);

      // Store the session details
      userManager.setAccessToken(accessToken);
      userManager.setUserId(userId);
      userManager.setUserName(displayName);
      if (recoveryCode) {
        userManager.setTempRecoveryCode(recoveryCode);
      }

      // Interact with router to navigate
      navigate({
        to: "/room/$roomId",
        params: { roomId },
        search: { name: displayName },
      });
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedSystemLabel = VOTING_SYSTEMS.find(
    (s) => s.id === votingSystem
  )?.label;

  return (
    <PageLayout>
      <DisplayNameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFinalSubmit}
      />

      <Header>
        {userManager.getUserName() && (
          <div className="flex items-center gap-4">
            <UserMenu name={userManager.getUserName()} onNameChange={() => { }} />
          </div>
        )}
      </Header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl"
        >
          <motion.h1 variants={itemVariants} className="text-2xl font-semibold text-slate-100 mb-10 sm:mb-16">
            Create new game
          </motion.h1>

          <form
            onSubmit={handleInitialSubmit}
            className="space-y-8"
          >
            <div className="space-y-8">
              {/* Game Name Input */}
              <motion.div variants={itemVariants} className="space-y-2 flex flex-col">
                <div className="flex items-center justify-start">
                  <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider flex items-center gap-2">
                    <SpadeIcon size={16} className="text-blue-500/70" />
                    Game Name
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="e.g. Sprint 32 Planning"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-xl py-4 px-6 text-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg pr-14"
                    required
                    autoFocus
                    disabled={isCreating}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <UserIcon size={24} />
                  </div>
                </div>
              </motion.div>

              {/* Custom Voting System Dropdown */}
              <motion.div variants={itemVariants} className="space-y-2 relative z-20 flex flex-col">
                <div className="flex items-center justify-start">
                  <label className="text-sm font-bold text-slate-400 ml-1 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={16} className="text-blue-500/70" />
                    Voting System
                  </label>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => !isCreating && setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isCreating}
                    className="w-full cursor-pointer bg-slate-800/50 border-2 border-slate-700 rounded-xl py-4 px-6 text-left text-lg text-white hover:border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate pr-8">{selectedSystemLabel}</span>
                    <div
                      className={`text-slate-500 transition-transform duration-200 group-hover:text-slate-400 ${isDropdownOpen ? "rotate-180" : ""
                        }`}
                    >
                      <ChevronDownIcon size={24} />
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
                          className={`cursor-pointer w-full text-left px-6 py-4 hover:bg-slate-700 transition-colors flex items-center border-b border-slate-700 last:border-0 ${votingSystem === sys.id
                            ? "bg-blue-600/10 text-blue-400 font-medium"
                            : "text-slate-300"
                            } `}
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
              </motion.div>
            </div>

            {/* CTA Button - Relocated closer to inputs */}
            <motion.div variants={itemVariants} className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isCreating}
                onMouseEnter={() => moveRightIconRef.current?.startAnimation()}
                onMouseLeave={() => moveRightIconRef.current?.stopAnimation()}
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <span>Create Game</span>
                )}
                {!isCreating && <MoveRightIcon ref={moveRightIconRef} />}
                {isCreating && <span>Creating...</span>}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </main>
    </PageLayout>
  );
};
