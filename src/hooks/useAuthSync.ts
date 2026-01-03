import { useEffect } from 'react';

export const useAuthSync = () => {
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'votedeck_access_token' && event.newValue === null) {
                // Token was removed (logout), reload to clear state/redirect
                window.location.reload();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
};
