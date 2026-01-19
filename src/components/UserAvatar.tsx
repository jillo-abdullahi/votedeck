import React, { useMemo } from "react";
import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';

export const UserAvatar: React.FC<{ name: string, size?: number, src?: string | null }> = ({ name, size = 48, src }) => {
    const avatarDataUri = useMemo(() => {
        if (src) return src;
        const avatar = createAvatar(botttsNeutral, {
            seed: name,
            size: size,
        });
        return avatar.toDataUri();
    }, [name, size, src]);

    return (
        <img
            src={avatarDataUri}
            alt={`${name}'s avatar`}
            className="rounded-full shrink-0"
            style={{ width: size, height: size, objectFit: 'cover' }}
        />
    );
};
