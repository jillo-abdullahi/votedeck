import React from "react";

interface ControlsProps {
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
  canReveal: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  revealed,
  onReveal,
  onReset,
  canReveal,
}) => {
  return (
    <div className="flex justify-center p-6">
      <button
        onClick={revealed ? onReset : onReveal}
        disabled={!revealed && !canReveal}
        className={`
          px-8 py-3 rounded-full font-bold text-lg transition-all duration-200 outline-none focus:ring-4 focus:ring-blue-500/20
          ${
            revealed
              ? "bg-slate-700 text-white hover:bg-slate-600"
              : canReveal
              ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 translate-y-0 active:translate-y-0.5"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }
        `}
      >
        {revealed ? "Start New Vote" : "Reveal Votes"}
      </button>
    </div>
  );
};
