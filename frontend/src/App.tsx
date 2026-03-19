import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import * as api from "./api/api.ts"
import { useAuth } from "./auth/useAuth";

import PrivateRoute from "./auth/PrivateRoute.tsx";
import PublicRoute from "./auth/PublicRoute.tsx";
import PrivateLayout from "./layout/PrivateLayout.tsx";
import PublicLayout from "./layout/PublicLayout.tsx";

import Login from "./pages/Login.tsx";
import SignIn from "./pages/SignIn.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Game from "./pages/Game.tsx";
import Tournament from "./pages/Tournament.tsx";
import Chat from "./pages/Chat.tsx";
import Profil from "./pages/Profil.tsx";
import Friends from "./pages/Friends.tsx";

function App() {
  // on récupère les fonctions login/clearAuth du contexte
  const { login, clearAuth, isLoading } = useAuth();

  useEffect(() => {
    // au démarrage de l'app, vérifie qui est connecté en appelant me()
    api.me()
      .then((user) => login(user)) //si connecté, on lance login() pour enregistrer le user
      .catch(() => clearAuth()); // si erreur -> pas connecté, on lance clearAuth() pour avoir user === null
  }, [login, clearAuth]);
  // Les dépendances assurent que cet effet s'exécute si login/clearAuth changent

  if (isLoading)
    return (
      <div>
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#DCE1E9]">
      <Routes>
        {/* Routes publiques */}
        <Route
          element={
            <PublicRoute>
              <PublicLayout />
            </PublicRoute>
          }
        >
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Routes privées */}
        <Route
          element={
            // <PrivateRoute>
              <PrivateLayout />
            // </PrivateRoute>
          }
        >
          {/* redirection /dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game" element={<Game />} />
          <Route path="/tournament" element={<Tournament />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/friends" element={<Friends />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
