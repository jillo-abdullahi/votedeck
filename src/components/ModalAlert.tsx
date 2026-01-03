import React, { type ReactNode } from "react";
import { InfoIcon, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalAlertProps {
    variant?: "info" | "warning" | "destructive";
    title?: string;
    description: ReactNode;
    icon?: ReactNode;
    className?: string;
}

export const ModalAlert: React.FC<ModalAlertProps> = ({
    variant = "info",
    description,
    icon,
    className
}) => {
    const variants = {
        info: {
            container: "bg-blue-500/10 border-blue-500/20 text-blue-100",
            iconBg: "text-blue-400",
            border: "border-blue-400/10",
            text: "text-slate-300"
        },
        warning: {
            container: "bg-amber-500/10 border-amber-500/20 text-amber-100",
            iconBg: "text-amber-400",
            border: "border-amber-400/10",
            text: "text-amber-200/80"
        },
        destructive: {
            container: "bg-red-500/10 border-red-500/20 text-red-100",
            iconBg: "text-red-400",
            border: "border-red-400/10",
            text: "text-red-300/80"
        }
    };

    const styles = variants[variant];
    const iconSize = 28;
    const DefaultIcon = variant === "info" ? <InfoIcon size={iconSize} /> : variant === "warning" ? <AlertTriangle size={iconSize} /> : <AlertCircle size={iconSize} />;

    return (
        <div className={cn(
            "border rounded-xl p-3 flex gap-1 text-left transition-all",
            styles.container,
            className
        )}>
            <div className={cn("px-2 py-1 rounded-lg h-fit shrink-0", styles.iconBg)}>
                {icon || DefaultIcon}
            </div>
            <div className={cn("text-md leading-relaxed border-l pl-3", styles.border, styles.text)}>
                {description}
            </div>
        </div>
    );
};
