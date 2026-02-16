import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function PrivateRoute({children}: {children: JSX.Element}) {
    //on lit user
    const {user} = useAuth();

    //si user === null on redirige vers la page /login
    if (!user)
        return <Navigate to="/login" replace />;

    //sinon vers la page children (dashboard par exemple)
    return children;
}