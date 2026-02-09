import { Link } from "react-router-dom"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from '../api/api.ts';

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pseudo, setPseudo] = useState("");
    const [hasTouched, setTouched] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLaoding] = useState(false);

    //check si la form est valide
    const isValidEmail = (email: string) => {
        const regex = new RegExp("^[a-z0-9._-]+@[a-z0-9._-]+.[a-z0-9._-]+$");
        if (!regex.test(email))
            return false;
        return true;
    };
    const isFilledInput = email.length > 0 && password.length > 0;
    const isValidForm = isFilledInput && isValidEmail(email);

    // requete post pour creer un user
    function submitForm(e : any) {
        e.preventDefault();
        const navigate = useNavigate();

        register({
            pseudo,
            email,
            password,
        })
            .then((data) => {
            console.log("Utilisateur créé: ", data); // Les données JSON analysées par l'appel `donnees.json()`
        })
            .catch(err => {
                setErrorMessage(err.message);
            }) 
            .finally(() => {
                setLaoding(false);
                navigate("/login");
            })
    }

    return (
        <div className="signin-container">
            <h2 className="signin-title">Inscrivez-vous maintenant !</h2>
            <form onSubmit={submitForm} onChange={() => setTouched(true)}>
                <label htmlFor="pseudo">Votre pseudo</label>
                <input
                    id="pseudo"
                    type="text"
                    name="pseudo"
                    placeholder="Terijo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                />
                {hasTouched && pseudo.length === 0 && <span style={{color: "red"}}>Pseudo requis</span>}

                <label htmlFor="email">Votre email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="chess-war@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {(hasTouched && !isValidEmail(email)) && <span style={{color: "red"}}>Invalid email.</span>}

                <label htmlFor="password">Votre Mot de passe</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="i-love-chocolat-123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {hasTouched && password.length === 0 && <span style={{color: "red"}}>Mot de passe requis</span>}

                {errorMessage && (
                    <span style={{color: "red"}}>
                        {errorMessage}
                    </span>
                )}

                <button type="submit" disabled={!isValidForm || loading}>
                    {loading ? "Inscription..." : "S'inscrire"}
                </button>
            </form>

            <p>
                Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
            </p>
        </div>
    )
}