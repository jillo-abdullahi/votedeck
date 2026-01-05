import React from 'react';
import { Crown, SpadeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomAvatarProps {
    isAdmin: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const RoomAvatar: React.FC<RoomAvatarProps> = ({ isAdmin, size = 'md', className }) => {
    const sizeConfig = {
        sm: { p: "p-2", icon: 16 },
        md: { p: "p-3", icon: 20 },
        lg: { p: "p-4", icon: 24 },
    };

    const { p, icon } = sizeConfig[size];

    return (
        <div className={cn(
            p,
            "bg-blue-500/10 rounded-lg text-blue-400",
            className
        )}>
            {isAdmin ? <Crown size={icon} /> : <SpadeIcon size={icon} />}
        </div>
    );
};
