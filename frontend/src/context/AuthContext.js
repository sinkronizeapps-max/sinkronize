import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { authAPI } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Carrega sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                authAPI.getUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        // Escuta mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await authAPI.getUser().catch(() => null);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const data = await authAPI.login({ email, password });
        const profile = await authAPI.getUser();
        setUser(profile);
        return profile;
    };

    const register = async (formData) => {
        await authAPI.register(formData);
        // Aguarda trigger criar o perfil
        await new Promise(r => setTimeout(r, 1000));
        const profile = await authAPI.getUser();
        setUser(profile);
        return profile;
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        const profile = await authAPI.getUser().catch(() => null);
        setUser(profile);
        return profile;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
