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

  //envoie les données au backend
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    login({
      identifier,
      password,
    })
      .then((data) => {
        console.log("Utilisateur connecté: ", data);
        //ajouter:
        //navigate("/dashboard");
      })
      .catch((err: Error) => {
        setErrorMessage(err.message);
      })
      .finally(() => {
        setLoading(false);
        navigate("/dashboard");
      });
  }

  return (
    <div className="glass-container">
      <h2 className="title-style mt-2 mb-8">Se connecter</h2>
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
          <span style={{ color: "red" }}>Champ requis</span>
        )}

        <label htmlFor="password">Mot de passe</label>
        <input
          name="password"
          type="password"
          placeholder="i-love-chocolat-123"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-style"
        />
        {hasTouched && password.length === 0 && (
          <span style={{ color: "red" }}>Champ requis</span>
        )}

        {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}

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
