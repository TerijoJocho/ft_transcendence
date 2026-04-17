import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../auth/useAuth";

import * as api from "../api/api.ts";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [hasTouched, setHasTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login: loginAuth } = useAuth();

  const isFilledInput = identifier.length > 0 && password.length > 0;

  //requete POST pour se connecter
  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const rawUser = await api.login({
        identifier,
        password,
      });
      const fullUser = await api.me();
      console.log("Utilisateur connecté: ", rawUser);
      loginAuth(fullUser);
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur serveur";
      setErrorMessage("Problème lors de la connexion, voir log.");
      console.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-container">
      <h2 className="title-style">Se connecter</h2>
      <form
        onSubmit={submitForm}
        onChange={() => setHasTouched(true)}
        className="form-container"
      >
        <label htmlFor="identifier" className="label-style">
          Email / Pseudo
        </label>
        <input
          name="identifier"
          type="text"
          placeholder="chess-war@gmail.com / ChessUser"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input-style"
        />
        {hasTouched && identifier.length === 0 && (
          <span className="error-style">Champ requis</span>
        )}

        <label htmlFor="password">Mot de passe</label>
        <input
          name="password"
          type="password"
          placeholder="*****************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-style"
        />
        <div className="flex items-center">
          {hasTouched && password.length === 0 && (
            <span className="error-style">Champ requis</span>
          )}

          <Link
            to="/forgot-password"
            className="ml-auto text-xs hover:underline text-violet-400 cursor-pointer"
          >
            Mot de passe oublié
          </Link>
        </div>

        {errorMessage && <span className="error-style">{errorMessage}</span>}

        <button
          type="submit"
          className={(!isFilledInput || loading) ? "disabled-button" : "button" }
          disabled={(!isFilledInput || loading)}
          aria-disabled={(!isFilledInput || loading)}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <button onClick={api.google} className="p-2 bg-white w-fit text-black rounded-lg mb-6 self-center hover:text-white hover:bg-black">
        Se connecter avec Google
      </button>

      <p className="text-xs font-medium self-center">
        Pas encore de compte ?{" "}
        <Link to="/signup" className="text-amber-600 hover:underline">
          Créer un compte
        </Link>
      </p>

      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-200">
        <Link to="/privacy-policy" className="hover:underline">Politique de confidentialité</Link>
        <Link to="/terms-of-service" className="hover:underline">Conditions d'utilisation</Link>
      </div>
    </div>
  );
}

export default Login;
