import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const r = await api.get("/auth/me");
            setUser(r.data);
        } catch (_e) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // CRITICAL: If returning from OAuth callback, skip the /me check.
        // AuthCallback will exchange the session_id and establish the session first.
        if (window.location.hash?.includes("session_id=")) {
            setLoading(false);
            return;
        }
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const r = await api.post("/auth/login", { email, password });
        if (r.data.token) localStorage.setItem("sk_token", r.data.token);
        setUser(r.data.user);
        return r.data.user;
    };

    const register = async (data) => {
        const r = await api.post("/auth/register", data);
        if (r.data.token) localStorage.setItem("sk_token", r.data.token);
        setUser(r.data.user);
        return r.data.user;
    };

    const logout = async () => {
        try { await api.post("/auth/logout"); } catch (_e) { /* ignore */ }
        localStorage.removeItem("sk_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
