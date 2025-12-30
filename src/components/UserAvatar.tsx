import React, { useMemo } from "react";
import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';

export const UserAvatar: React.FC<{ name: string, size?: number }> = ({ name, size = 48 }) => {
    const avatarDataUri = useMemo(() => {
        const avatar = createAvatar(botttsNeutral, {
            seed: name,
            size: size,
        });
        return avatar.toDataUri();
    }, [name, size]);

    return (
        <img
            src={avatarDataUri}
            alt={`${name}'s avatar`}
            className="rounded-full"
        />
    );
};
