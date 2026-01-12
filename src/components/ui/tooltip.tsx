import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = "bottom" }) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPosition = () => {
        switch (side) {
            case "top":
                return { bottom: "100%", left: "50%", x: "-50%", mb: 2 };
            case "bottom":
                return { top: "100%", left: "50%", x: "-50%", mt: 2 };
            case "left":
                return { right: "100%", top: "50%", y: "-50%", mr: 2 };
            case "right":
                return { left: "100%", top: "50%", y: "-50%", ml: 2 };
            default:
                return { top: "100%", left: "50%", x: "-50%", mt: 2 };
        }
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, ...getPosition() }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 px-3 py-2 text-xs font-semibold text-blue-500/80 bg-slate-900 border border-slate-800/50 rounded-lg whitespace-nowrap pointer-events-none mt-1"
                        style={getPosition() as any}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
