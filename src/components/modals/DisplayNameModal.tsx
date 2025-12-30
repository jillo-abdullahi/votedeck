import React from "react";
import { Button } from "../ui/button";
import { ModalHeader } from "@/components/ModalHeader";
import { UserIcon } from "lucide-react";

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
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
              className="flex-2 text-lg"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
