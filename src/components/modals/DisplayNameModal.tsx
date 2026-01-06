import React from "react";
import { Button } from "../ui/button";
import { ModalHeader } from "@/components/ModalHeader";
import { UserIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialValue?: string;
  isLoading?: boolean;
}

export const DisplayNameModal: React.FC<DisplayNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValue = "",
  isLoading = false,
}) => {
  const [name, setName] = React.useState(initialValue);

  React.useEffect(() => {
    if (isOpen) {
      setName(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={isLoading ? undefined : onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-slate-900 border-2 border-slate-800/50 rounded-3xl p-8 w-full max-w-lg shadow-2xl flex flex-col"
          >
            <ModalHeader
              title={initialValue ? "Change your name" : "Enter your name"}
              subtitle="How should you appear to other players?"
              className="mb-8"
              icon={<UserIcon className="w-12 h-12 text-blue-500" />}
              onClose={isLoading ? undefined : onClose}
            />

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Your display name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-xl py-4 px-6 text-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!name.trim() || isLoading}
                  className="flex-2 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
