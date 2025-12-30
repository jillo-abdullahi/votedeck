import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'votedeck_user_id';

export const userManager = {
    getUserId: (): string => {
        let id = localStorage.getItem(USER_ID_KEY);
        if (!id) {
            id = uuidv4();
            localStorage.setItem(USER_ID_KEY, id);
        }
        return id;
    },
};
