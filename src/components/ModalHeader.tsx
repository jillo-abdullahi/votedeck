import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { XIcon, type XIconHandle } from "@/components/icons/XIcon";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
    title: string;
    subtitle: React.ReactNode;
    icon?: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    icon,
    onClose,
    className,
}) => {
    const xRef = useRef<XIconHandle>(null);

    return (
        <div className={cn("relative", className)}>
            {/* Close Button - Only render if onClose is provided */}
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    onMouseEnter={() => xRef.current?.startAnimation()}
                    onMouseLeave={() => xRef.current?.stopAnimation()}
                    className="absolute -top-2 -right-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full z-10"
                >
                    <XIcon className="w-6 h-6" ref={xRef} />
                </Button>
            )}

            {/* Header Content */}
            <div className="flex items-center justify-start space-x-2 mb-2 mt-4">
                {icon && (
                    <div className="p-2 border-r border-slate-700">
                        {icon}
                    </div>
                )}
                <div className={cn("text-left", icon && "pl-2")}>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">
                        {title}
                    </h2>
                    <div className="text-slate-400 text-lg truncate max-w-sm">
                        {subtitle}
                    </div>
                </div>
            </div>
        </div>
    );
};
