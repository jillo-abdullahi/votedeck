const USER_ID_KEY = 'votedeck_user_id';


let tempRecoveryCode: string | null = null;

export const userManager = {
    getUserId: (): string => {
        return localStorage.getItem(USER_ID_KEY) || '';
    },
    setUserId: (id: string): void => {
        if (id) {
            localStorage.setItem(USER_ID_KEY, id);
        } else {
            localStorage.removeItem(USER_ID_KEY);
        }
    },
    getUserName: (): string => {
        return localStorage.getItem('votedeck_user_name') || '';
    },
    setUserName: (name: string): void => {
        if (name) {
            localStorage.setItem('votedeck_user_name', name);
        } else {
            localStorage.removeItem('votedeck_user_name');
        }
    },
    getTempRecoveryCode: (): string | null => {
        return tempRecoveryCode;
    },
    setTempRecoveryCode: (code: string | null): void => {
        tempRecoveryCode = code;
    }
};
