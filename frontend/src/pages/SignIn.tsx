import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { register } from "../api/api.ts";
import { useAuth } from "../auth/useAuth";


export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [hasTouched, setTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  //check si la form est valide
  const isValidEmail = (email: string) => {
    const regex = new RegExp("^[a-z0-9._-]+@[a-z0-9._-]+.[a-z0-9._-]+$");
    if (!regex.test(email)) return false;
    return true;
  };
  const isFilledInput = email.length > 0 && password.length > 0;
  const isValidForm = isFilledInput && isValidEmail(email);

  // requete post pour creer un user
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    register({
      pseudo,
      email,
      password,
    })
      .then((data) => {
        console.log("Utilisateur créé: ", data);
        // Connecte automatiquement si le backend retourne l'utilisateur
        // belek supp cette logique 
        if (data && data.id && data.pseudo) {
          login({ id: data.id, pseudo: data.pseudo });
          navigate("/dashboard");
        } else {
          // Sinon redirige vers login pour se connecter manuellement
          navigate("/login");
        }
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setLoading(false);
      });
  }

  return (
    <div
      className="
        flex flex-col
        w-full max-w-md
        backdrop-blur-sm border border-white/10
        rounded-xl
        shadow-2xl
        p-8
       text-white
      "
    >
      <h2 className="text-2xl tracking-widest mt-2 mb-8 font-medium">Inscrivez-vous maintenant !</h2>
      <form
        onSubmit={submitForm}
        onChange={() => setTouched(true)}
        className="flex flex-col gap-4 m-2 text-base"
      >
        <label
          htmlFor="pseudo"
          className="tracking-wide text-sm font-medium"
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
          className="rounded-sm p-2 border"
        />
        {hasTouched && pseudo.length === 0 && (
          <span style={{ color: "red" }}>Pseudo requis</span>
        )}

        <label htmlFor="email" className="tracking-wide text-sm font-medium">Votre email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="chess-war@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm p-2"
        />
        {hasTouched && !isValidEmail(email) && (
          <span style={{ color: "red" }}>Invalid email.</span>
        )}

        <label htmlFor="password" className="tracking-wide text-sm font-medium">Votre Mot de passe</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="********************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm p-2 text-"
        />
        {hasTouched && password.length === 0 && (
          <span style={{ color: "red" }}>Mot de passe requis</span>
        )}

        {errorMessage && <span style={{ color: "red" }}>{errorMessage}</span>}

        <button
          type="submit"
          disabled={!isValidForm || loading}
          className="rounded-lg p-3 bg-sky-600 mt-4 mb-4 hover:bg-sky-500"
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
