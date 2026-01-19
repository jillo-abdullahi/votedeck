import type { RevealPolicy } from "@/types";

export const REVEAL_POLICIES: { id: RevealPolicy; label: string; description: string }[] = [
    { id: "everyone", label: "Everyone", description: "Anyone in the game can reveal votes and start new rounds." },
    { id: "admin", label: "Only Me", description: "Only you can reveal votes and start new rounds." },
];

export const COUNTDOWN_SETTINGS = {
    label: "Reveal Countdown",
    description: "Show a 3-second countdown before revealing votes"
};
