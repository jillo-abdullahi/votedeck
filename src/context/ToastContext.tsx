import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import { Toast, type ToastType } from "@/components/ui/toast";
import { v4 as uuidv4 } from "uuid";

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType; duration?: number }[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
        const id = uuidv4();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message: string, duration?: number) => addToast(message, "success", duration), [addToast]);
    const error = useCallback((message: string, duration?: number) => addToast(message, "error", duration), [addToast]);
    const info = useCallback((message: string, duration?: number) => addToast(message, "info", duration), [addToast]);

    return (
        <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
            {children}
            {createPortal(
                <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none p-4">
                    <AnimatePresence mode="popLayout">
                        {toasts.map((t) => (
                            <Toast key={t.id} {...t} onDismiss={removeToast} />
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
