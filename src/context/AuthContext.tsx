
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInAnonymously,
    signOut as firebaseSignOut,
    type User
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInGoogle: () => Promise<any>;
    signInAnonymous: () => Promise<any>;
    signOut: () => Promise<void>;
    updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInGoogle = () => signInWithPopup(auth, googleProvider);
    const signInAnonymous = () => signInAnonymously(auth);
    const signOut = () => firebaseSignOut(auth);

    const updateUserProfile = async (profile: { displayName?: string; photoURL?: string }) => {
        if (auth.currentUser) {
            const { updateProfile } = await import("firebase/auth");
            await updateProfile(auth.currentUser, profile);
            await auth.currentUser.reload();
            // Force a state update by creating a new object reference, 
            // otherwise React might not detect the change if the User object is mutated in place.
            // We use auth.currentUser again to get the freshest data.
            // Spreading user object might not work perfectly due to internal properties, 
            // but setting it to auth.currentUser (which is a new reference after reload or we treat it as such) 
            // usually works if we trick React.
            // However, a safer bet is re-setting from auth.currentUser.
            setUser({ ...auth.currentUser } as User);
            // Note: The User object from Firebase is a complex object. 
            // Creating a shallow copy via spread is usually enough to trigger React,
            // but we must cast it back to User.
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInGoogle, signInAnonymous, signOut, updateUserProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
