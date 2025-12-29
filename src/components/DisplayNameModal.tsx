import React, { useState } from "react";

interface DisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const DisplayNameModal: React.FC<DisplayNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-bold text-white mb-2 text-left">
          Enter your name
        </h2>
        <p className="text-slate-400 mb-8 text-lg text-left">
          How should you appear to other players?
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <div className="relative group">
              <input
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl py-4 px-6 text-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 hover:text-white font-bold text-lg transition-colors hover:bg-slate-700/50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
