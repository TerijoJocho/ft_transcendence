import { Link } from "react-router-dom"
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { login } from '../api/api.ts';

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [hasTouched, setHasTouched] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLaoding] = useState(false);

    const isFilledInput = identifier.length > 0 && password.length > 0;

    //envoie les données au backend
    function submitForm(e : any) {
        e.preventDefault();
        setLaoding(true);
        const navigate = useNavigate();

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
                setLaoding(false);
                navigate("/dashboard");
            })
    }

    return (
        <div className='login-container'>
            <form onSubmit={submitForm} onChange={() => setHasTouched(true)}>
                <h2 className='login-title'>Se connecter</h2>
                <label htmlFor='identifier'>Email / Pseudo</label>
                <input
                    name='identifier'
                    type='text'
                    placeholder='chess-war@gmail.com / ChessUser'
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                {(hasTouched && identifier.length === 0) && (
                    <span style={{ color: "red" }}>Champ requis</span>
                )}

                <label htmlFor='password'>Mot de passe</label>
                <input
                    name='password'
                    type='password'
                    placeholder='i-love-chocolat-123'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {(hasTouched && password.length === 0) && (
                    <span style={{ color: "red" }}>Champ requis</span>
                )}

                {errorMessage && (
                    <span style={{color: "red"}}>
                        {errorMessage}
                    </span>
                )}

                <button type='submit' disabled={!isFilledInput || loading} className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500 transition duration-300 shadow-lg hover:shadow-blue-500/50">
                    {loading ? "Connexion..." : "Se connecter"}
                </button>
            </form>

            <p>
                Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
            </p>
        </div>
    );
}

export default Login