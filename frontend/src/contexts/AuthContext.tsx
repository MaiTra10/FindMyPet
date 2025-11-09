import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  photoURL?: string;
  idToken?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (idToken: string, userData: Omit<User, 'idToken'>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  useMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  useMockAuth?: boolean;
}

export function AuthProvider({ children, useMockAuth = false }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    console.log("=== AuthProvider Init ===");
    const storedUser = localStorage.getItem("findmypet_user");
    console.log("Stored user in localStorage:", storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("findmypet_user");
      }
    }
    setIsLoading(false);
    console.log("======================");
  }, []);

  // Debug user state changes
  useEffect(() => {
    console.log("=== User State Changed ===");
    console.log("Current user:", user);
    console.log("isAuthenticated:", !!user);
    console.log("========================");
  }, [user]);

  const login = async (idToken: string, userData: Omit<User, 'idToken'>) => {
    try {
      // For guest/demo mode, skip API calls and log in immediately
      if (idToken === "guest-token-123" || idToken === "mock-token-123") {
        const userWithToken: User = { 
          ...userData, 
          idToken,
          photoURL: userData.picture 
        };
        setUser(userWithToken);
        localStorage.setItem("findmypet_user", JSON.stringify(userWithToken));
        return;
      }

      // For real Google auth, send id_token to backend for verification

      try {
        const response = await fetch("/api/login/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken })
        });

        if (response.ok) {
          const userWithToken: User = { 
            ...userData, 
            idToken,
            photoURL: userData.picture 
          };
          console.log("Backend login successful, setting user:", userWithToken);
          setUser(userWithToken);
          localStorage.setItem("findmypet_user", JSON.stringify(userWithToken));
          return; // Exit early if backend login works
        }
      } catch (fetchError) {
        console.log("API not available (expected for frontend-only mode)");
      }
      
      // If we get here, backend login failed or doesn't exist
      // Log in locally for frontend-only auth
      const userWithToken: User = { 
        ...userData, 
        idToken,
        photoURL: userData.picture 
      };
      console.log("Logging in locally with user data:", userWithToken);
      setUser(userWithToken);
      localStorage.setItem("findmypet_user", JSON.stringify(userWithToken));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("findmypet_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        useMockAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
