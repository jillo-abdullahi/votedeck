import { useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInAnonymously,
    signOut as firebaseSignOut,
    type User
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInGoogle = async () => {
        return signInWithPopup(auth, googleProvider);
    };

    const signInAnonymous = async () => {
        return signInAnonymously(auth);
    };

    const signOut = async () => {
        return firebaseSignOut(auth);
    };

    return {
        user,
        loading,
        signInGoogle,
        signInAnonymous,
        signOut
    };
}
