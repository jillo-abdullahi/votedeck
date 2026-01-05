import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
    return (
        <div className={cn("min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col px-6", className)}>
            {children}
        </div>
    );
};
