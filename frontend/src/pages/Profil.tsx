import Header from "../components/Header.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import ProfileInfos from "../components/ProfileInfos.tsx";
import DeleteAccountModal from "../components/DeleteAccountModal.tsx";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth.ts";
import * as api from '../api/api.ts';

function Profil() {
    const {user} = useAuth();

    const [form, setForm] = useState({
        pseudo: user.pseudo,
        // email: user.email,
        newPassword: "",
        confirmNewPassword: "",
    });
    const [feedback, setFeedback] = useState<{message: string, type: 'pending' | 'success' | 'error'} | null>(null);

    useEffect(() => {
        if (!feedback)
            return;
        const timer = setTimeout(() => setFeedback(null), 3000);
        return (() => clearTimeout(timer));
    }, [feedback]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    function handleSubmit() {
        if (isPasswordChanged && !isPasswordValid)
        {
            setFeedback({message: 'Mot de passe invalide', type: 'error'});
            return;
        }
        setFeedback({message: 'Chargement', type: 'pending'});
        api.updateProfile(form)
            .then(() => setFeedback({message: 'Changement effectué', type: 'success'}))
            .catch((e) => setFeedback({message: e instanceof Error ? e.message : String(e), type: 'error'}))
    
        console.log(form);
    }

    const isPasswordChanged = form.newPassword.length > 0 && form.confirmNewPassword.length > 0;
    const isPasswordValid = form.newPassword === form.confirmNewPassword && form.newPassword.length >= 8;

    return (
        <div className="border rounded-md bg-white text-black h-full">
            <Header title="Page de profil"/>
            <div className="flex flex-col items-center gap-12">
                <ProfileHeader />
                <ProfileInfos form={form} handleChange={handleChange} handleSubmit={handleSubmit}/>
                <DeleteAccountModal />
                <span className={`fixed top-10 right-10 py-2 px-6 ${feedback?.type === "success" ? 'text-green-500' : feedback?.type === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
                    {feedback?.message}
                </span>
            </div>
        </div>
    );
}

export default Profil;