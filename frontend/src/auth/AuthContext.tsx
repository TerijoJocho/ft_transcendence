//stocke user
//expose login, logout
//dit si le user est connecté

import { createContext, useContext, useState } from "react";

type User = {
    id: number;
    pseudo: string;
};

type AuthContextType = {
    user: User | null;
    login: (user: User) => void; //a remplacer par GET /auth/me
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    //a remplacer par un GET /auth/me
    function login(user: User) {
        setUser(user);
    }

    function logout() {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
