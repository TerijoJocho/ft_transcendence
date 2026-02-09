//si user === null -> dehors
//sinon accès autorisé

import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({children}: {children: JSX.Element}) {
    const {user} = useAuth();

    if (!user)
        return <Navigate to="/login" replace />;

    return children;
}