import type { JSX } from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "./useAuth";

export default function PrivateRoute({children}: {children: JSX.Element}) {
    // const {user} = useAuth();

    // if (!user)
    //     return <Navigate to="/login" replace />;

    //sinon vers la page children (dashboard par exemple)
    return children;
}