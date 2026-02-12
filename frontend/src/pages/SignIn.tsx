import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { register } from "../api/api.ts";

export default function SignIn() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [hasTouched, setTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //check si la form est valide
  const isValidMail = (mail: string) => {
    const regex = new RegExp("^[a-z0-9._-]+@[a-z0-9._-]+.[a-z0-9._-]+$");
    if (!regex.test(mail)) return false;
    return true;
  };
  const isFilledInput = mail.length > 0 && password.length > 0;
  const isValidForm = isFilledInput && isValidMail(mail);

  // requete post pour creer un user
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    register({
      pseudo,
      mail,
      password,
    })
      .then((data) => {
        console.log("Utilisateur créé: ", data);
        navigate("/login");
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setLoading(false);
      });
  }

  return (
    <div
      className="glass-container"
    >
      <h2 className="title-style">Inscrivez-vous maintenant !</h2>
      <form
        onSubmit={submitForm}
        onChange={() => setTouched(true)}
        className="form-container"
      >
        <label
          htmlFor="pseudo"
          className="label-style"
        >
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

        <label htmlFor="email" className="tracking-wide text-sm font-medium">Votre email</label>
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

        <label htmlFor="password" className="tracking-wide text-sm font-medium">Votre Mot de passe</label>
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
          disabled={!isValidForm || loading}
          className="button"
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <p className="text-xs font-medium self-center">
        Vous avez déjà un compte ? <Link to="/login" className="text-amber-600 hover:underline">Connectez-vous</Link>
      </p>
    </div>
  );
}
