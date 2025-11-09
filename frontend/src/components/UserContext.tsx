// UserContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserType } from "./AuthButton";

export interface AuthUser {
    user: UserType;
    raw: string; // raw JWT
}

interface UserContextType {
    authUser: AuthUser | null;
    setAuthUser: (authUser: AuthUser | null) => void;
}

const UserContext = createContext<UserContextType>({
    authUser: null,
    setAuthUser: () => { },
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("authUser");
        if (stored) setAuthUser(JSON.parse(stored));
    }, []);

    useEffect(() => {
        if (authUser) {
            localStorage.setItem("authUser", JSON.stringify(authUser));
        } else {
            localStorage.removeItem("authUser");
        }
    }, [authUser]);

    return (
        <UserContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
