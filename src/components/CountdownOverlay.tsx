import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
    duration?: number;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ duration = 3 }) => {
    const [count, setCount] = useState(duration);

    useEffect(() => {
        if (count === 0) {
            return;
        }

        const timer = setTimeout(() => {
            setCount(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 rounded-[1.8rem]"
        >
            <AnimatePresence mode="wait">
                {count > 0 && (
                    <motion.div
                        key={count}
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl"
                    >
                        {count}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
