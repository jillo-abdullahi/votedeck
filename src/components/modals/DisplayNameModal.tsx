import React from "react";
import { Button } from "../ui/button";
import { ModalHeader } from "@/components/ModalHeader";
import { UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialValue?: string;
}

export const DisplayNameModal: React.FC<DisplayNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValue = "",
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
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl flex flex-col"
          >
            <ModalHeader
              title={initialValue ? "Change your name" : "Enter your name"}
              subtitle="How should you appear to other players?"
              className="mb-8"
              icon={<UserIcon className="w-12 h-12 text-blue-500" />}
              onClose={onClose}
            />

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
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={!name.trim()}
                  className="flex-2 text-lg shadow-lg shadow-blue-500/20"
                >
                  Continue
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
