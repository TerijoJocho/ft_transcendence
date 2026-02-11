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
    <div
      className="
        min-h-screen
        bg-[linear-gradient(90deg,#121216_0%,#121216_7.692%,#16171a_calc(7.692%+1px),#16171a_15.385%,#1a1b1f_calc(15.385%+1px),#1a1b1f_23.077%,#1f2023_calc(23.077%+1px),#1f2023_30.769%,#232427_calc(30.769%+1px),#232427_38.462%,#27282b_calc(38.462%+1px),#27282b_46.154%,#2b2c2f_calc(46.154%+1px),#2b2c2f_53.846%,#2f3033_calc(53.846%+1px),#2f3033_61.538%,#323337_calc(61.538%+1px),#323337_69.231%,#36373a_calc(69.231%+1px),#36373a_76.923%,#38393d_calc(76.923%+1px),#38393d_84.615%,#3b3c40_calc(84.615%+1px),#3b3c40_92.308%,#3d3e42_calc(92.308%+1px)_100%)]
        flex justify-center items-center
        "
    >
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
    </div>
  );
}

export default App;
