import { createContext } from "react";

export interface AuthContextType {
    user: any;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);