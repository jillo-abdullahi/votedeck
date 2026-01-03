import React from 'react';
import { Crown, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomAvatarProps {
    isAdmin: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const RoomAvatar: React.FC<RoomAvatarProps> = ({ isAdmin, size = 'md', className }) => {
    const sizeConfig = {
        sm: { p: "p-2", icon: 20 },
        md: { p: "p-3", icon: 24 },
        lg: { p: "p-4", icon: 32 },
    };

    const { p, icon } = sizeConfig[size];

    return (
        <div className={cn(
            p,
            "bg-blue-500/10 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white transition-colors",
            className
        )}>
            {isAdmin ? <Crown size={icon} /> : <User size={icon} />}
        </div>
    );
};
