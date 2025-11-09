import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserType } from "./AuthButton";

interface UserContextType {
    user: UserType | null;
    setUser: (user: UserType | null) => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => { },
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(null);

    // Load user from localStorage on initial mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
