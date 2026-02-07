import { useState } from 'react'

function LoginSection() {
    const   [email, setEmail] = useState("");
    const   [password, setPassword] = useState("");
    const   [hasTouched, setTouched] = useState(false);

    const   isValidEmail = (email: string) => {
        const     regex = new RegExp("^[a-z0-9._-]+@[a-z0-9._-]+.[a-z0-9._-]+$");
        if (!regex.test(email))
            return false;
        return true;
    };

    const   isFilledInput = email.length > 0 && password.length > 0;

    const   isValidForm = isFilledInput && isValidEmail(email);

    function submit(e : React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        alert(`Valeur de l'email: ${email} ; et du mot de passe: ${password}`);
    }

    return (
        <form onSubmit={submit} onChange={() => setTouched(true)}>
            <label htmlFor='email'>Email</label>
            <input
                name='email'
                type='email'
                placeholder='example@gmail.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {(hasTouched && !isValidEmail(email)) && <p>Invalid email.</p>}

            <label htmlFor='password'>Password</label>
            <input
                name='password'
                type='password'
                placeholder='i-love-chocolat-123'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type='submit' disabled={!isValidForm} className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500 transition duration-300 shadow-lg hover:shadow-blue-500/50">
                Se connecter
            </button>
        </form>
    );
}

export default LoginSection