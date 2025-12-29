import React, { useMemo } from "react";
import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';

export const UserAvatar: React.FC<{ name: string }> = ({ name }) => {
    const avatarDataUri = useMemo(() => {
        const avatar = createAvatar(botttsNeutral, {
            seed: name,
            size: 48,
        });
        return avatar.toDataUri();
    }, [name]);

    return (
        <img
            src={avatarDataUri}
            alt={`${name}'s avatar`}
            className="w-10 h-10 rounded-full"
        />
    );
};
