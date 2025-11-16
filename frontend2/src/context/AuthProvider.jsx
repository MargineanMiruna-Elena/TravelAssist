import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { login as loginService, register as registerService } from "../service/authService";

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            if (!saved || saved === "undefined") {
                localStorage.removeItem("user");
                return null;
            }
            return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem("user");
            return null;
        }
    });

    const login = async (email, password) => {
        const data = await loginService(email, password);

        if (!data?.token) {
            throw new Error("No token returned from server");
        }

        localStorage.setItem("jwt", data.token);

        const decoded = jwtDecode(data.token);
        const currentUser = {
            email: decoded.sub || "",
            username: decoded.username || ""
        };

        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
    };

    const register = async (name, email, password) => {
        const data = await registerService(name, email, password);

        if (!data?.token) {
            throw new Error("No token returned from server");
        }

        localStorage.setItem("jwt", data.token);

        const decoded = jwtDecode(data.token);
        const currentUser = {
            email: decoded.sub || "",
            username: decoded.username || name
        };

        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
    };

    const logout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
