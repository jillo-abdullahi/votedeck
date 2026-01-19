import React, { useMemo } from "react";
import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';

export const UserAvatar: React.FC<{ name: string, size?: number, src?: string | null }> = ({ name, size = 48, src }) => {
    const [imageError, setImageError] = React.useState(false);

    // Reset error if src changes
    React.useEffect(() => {
        setImageError(false);
    }, [src]);

    const avatarSource = useMemo(() => {
        if (src && !imageError) return src;

        const avatar = createAvatar(botttsNeutral, {
            seed: name,
            size: size,
        });
        return avatar.toDataUri();
    }, [name, size, src, imageError]);

    return (
        <img
            src={avatarSource}
            alt={`${name}'s avatar`}
            className="rounded-full shrink-0 bg-slate-800"
            style={{ width: size, height: size, objectFit: 'cover' }}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
        />
    );
};
