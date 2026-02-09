import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { me } from "./api/api.ts";
import { useAuth } from "./auth/useAuth";

import Login from "./pages/Login.tsx";
import SignIn from "./pages/SignIn.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PrivateRoute from "./auth/PrivateRoute.tsx";
import PublicRoute from "./auth/PublicRoute.tsx";

function App() {
  const { login, clearAuth } = useAuth();
  // Récupère les fonctions login/clearAuth du contexte

  useEffect(() => {
    // Au démarrage de l'app, vérifie qui est connecté
    me()
      .then((user) => login(user)) //si connecté, on lance login() pour enregistrer le user
      .catch(() => clearAuth()); // si erreur -> pas connecté, on lance clearAuth() pour avoir user === null
  }, [login, clearAuth]);
  // Les dépendances assurent que cet effet s'exécute si login/clearAuth changent

  return (
    <Routes>
      {/* Redirection par default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/signup" element={<SignIn />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Fallback si route inconnue */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
