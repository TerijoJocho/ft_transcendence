import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { isValidMail } from "../utils/isValidMail.ts";
import {
  extractAuthDebugMessage,
  toAuthErrorMessage,
} from "../utils/authErrorMessage";
import * as api from "../api/api.ts";

export default function SignIn() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [hasTouched, setTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //check si la form est valide
  const isFilledInput: boolean =
    mail.length > 0 && password.length > 0 && pseudo.length > 0;
  const isValidForm = isFilledInput && isValidMail(mail);

  // requete post pour creer un user
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    api
      .register({
        pseudo,
        mail,
        password,
      })
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        setErrorMessage(toAuthErrorMessage(err, "signup"));
        console.error(extractAuthDebugMessage(err));
        setLoading(false);
      });
  }

  return (
    <div className="glass-container">
      <h2 className="title-style">Inscrivez-vous maintenant !</h2>
      <form
        onSubmit={submitForm}
        onChange={() => setTouched(true)}
        className="form-container"
      >
        <label htmlFor="pseudo" className="label-style">
          Votre pseudo
        </label>
        <input
          id="pseudo"
          type="text"
          name="pseudo"
          placeholder="King"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="input-style "
        />
        {hasTouched && pseudo.length === 0 && (
          <span className="error-style">Pseudo requis</span>
        )}

        <label htmlFor="email" className="tracking-wide text-sm font-medium">
          Votre email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="chess-war@gmail.com"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          className="input-style"
        />
        {hasTouched && !isValidMail(mail) && (
          <span className="error-style">Email invalide</span>
        )}

        <label htmlFor="password" className="tracking-wide text-sm font-medium">
          Votre Mot de passe
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="********************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-style"
        />
        {hasTouched && password.length === 0 && (
          <span className="error-style">Mot de passe requis</span>
        )}

        {errorMessage && <span className="error-style">{errorMessage}</span>}

        <button
          type="submit"
          className={!isValidForm || loading ? "disabled-button" : "button"}
          disabled={!isValidForm || loading}
          aria-disabled={!isValidForm || loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <button
        onClick={api.google}
        className="p-2 bg-white dark:bg-zinc-900 w-fit text-black dark:text-zinc-100 border border-transparent dark:border-zinc-700 rounded-lg mb-6 self-center hover:text-white hover:bg-black dark:hover:bg-zinc-800"
      >
        Créer un compte avec Google
      </button>

      <p className="text-xs font-medium self-center">
        Vous avez déjà un compte ?{" "}
        <Link to="/login" className="text-amber-600 hover:underline">
          Connectez-vous
        </Link>
      </p>

      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-200 dark:text-zinc-300">
        <Link to="/privacy-policy" className="hover:underline">
          Politique de confidentialité
        </Link>
        <Link to="/terms-of-service" className="hover:underline">
          Conditions d'utilisation
        </Link>
      </div>
    </div>
  );
}
