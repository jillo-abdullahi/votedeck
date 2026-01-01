import React, { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
// import { HomeIcon } from "lucide-react";
import { HouseIcon, type HouseHandle } from "./icons/HouseIcon";
import { motion } from "framer-motion";

interface NotFoundViewProps {
    message?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
    message = "Page Not Found"
}) => {
    const navigate = useNavigate();
    const houseRef = useRef<HouseHandle>(null);

    const isRoomNotFound = message.toLowerCase().includes("room");

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                    duration: 0.6
                }}
                className="max-w-md w-full flex flex-col items-center gap-8"
            >
                {/* Mascot Image */}
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <img
                        src="/agree-15.png"
                        alt="Not found mascot"
                        className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl animate-float rounded-full"
                    />
                </div>

                {/* Error Message */}
                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Whoops!
                    </h1>
                    <p className="text-xl text-slate-400 font-medium">
                        {isRoomNotFound
                            ? "We couldn't find the planning room you're looking for."
                            : "The page you're looking for doesn't exist or has been moved."}
                    </p>
                    <div className="pt-2 text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                        {isRoomNotFound
                            ? "It might have been deleted, or the link you followed could be incorrect."
                            : "Double check the URL or head back to the landing page to start fresh."}
                    </div>
                </div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 w-full"
                >
                    <Button
                        size="lg"
                        onClick={() => navigate({ to: "/" })}
                        className="w-full"
                        onMouseEnter={() => houseRef.current?.startAnimation()}
                        onMouseLeave={() => houseRef.current?.stopAnimation()}
                    >
                        <HouseIcon ref={houseRef} className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform" />
                        Back to Home
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};
