import { Link, useNavigate } from "react-router-dom";
import { useState} from "react";
import type { FormEvent } from "react";
import { login } from "../api/api.ts";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [hasTouched, setHasTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isFilledInput = identifier.length > 0 && password.length > 0;

  //requete POST pour se connecter
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    login({
      identifier,
      password,
    })
      .then((data) => {
        console.log("Utilisateur connecté: ", data);
        navigate("/dashboard");
      })
      .catch((err: Error) => {
        setErrorMessage(err.message);
        setLoading(false);
      })
  }

  return (
    <div className="glass-container">
      <h2 className="title-style">Se connecter</h2>
      <form
        onSubmit={submitForm}
        onChange={() => setHasTouched(true)}
        className="form-container"
      >
        <label
          htmlFor="identifier"
          className="label-style"
        >
          Email / Pseudo
        </label>
        <input
          name="identifier"
          type="text"
          placeholder="chess-war@gmail.com / ChessUser"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="input-style "
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
            className="ml-auto text-xs hover:underline text-sky-400 cursor-pointer"
          >
            Mot de passe oublié
          </Link>
        </div>

        {errorMessage && <span className="error-style">{errorMessage}</span>}

        <button
          type="submit"
          disabled={!isFilledInput || loading}
          className="button"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-xs font-medium self-center">
        Pas encore de compte ? <Link to="/signup" className="text-amber-600 hover:underline">Créer un compte</Link>
      </p>
    </div>
  );
}

export default Login;
