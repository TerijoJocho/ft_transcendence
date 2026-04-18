import { type ChangeEvent, useState } from "react";
import {type User} from '../auth/core/authCore.ts';
interface ProfileInfosForm {
    pseudo: string;
    email: string;
    newPassword: string;
    confirmNewPassword: string;
    avatar: string;
}
interface ProfileInfosProps {
    form: ProfileInfosForm;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: () => void;
    user: User;
}
export default function ProfileInfos({form, handleChange, handleSubmit, user}: ProfileInfosProps) {
    const [canNotWrite, setCanNotWrite] = useState<boolean>(true);

    function activateForm() {
        setCanNotWrite(prev => !prev);
        if (!canNotWrite)
            handleSubmit()
    }
    return(
        <section className="flex flex-col gap-6">
            <div className="flex flex-col border rounded-md p-2">
                <label htmlFor="username" className="text-violet-300 mb-2">Pseudo</label>
                <input 
                    type="text" 
                    id="username" 
                    disabled={canNotWrite} 
                    className='input-style border-b border-b-violet-300'
                    value={form.pseudo}
                    name="pseudo"
                    onChange={(e) => handleChange(e)}
                />
            </div>
            <div className="flex flex-col border rounded-md p-4">
                <label htmlFor="email" className="text-violet-300 mb-2">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    disabled={user.isGoogleUser ?  true : canNotWrite} 
                    className={`input-style border-b border-b-violet-300 ${user.isGoogleUser ? "cursor-not-allowed" : ""}`}
                    value={form.email}
                    name="email"
                    onChange={(e) => handleChange(e)}
                /> 
            </div>
            {
                !canNotWrite &&
                    <>
                        {!user.isGoogleUser &&
                            <>
                                <div className="flex flex-col border rounded-md p-4">
                                    <label htmlFor="password" className="text-violet-300 mb-2">Nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        disabled={canNotWrite}  
                                        className="input-style border-b border-b-violet-300"
                                        value={form.newPassword}
                                        name="newPassword"
                                        onChange={(e) => handleChange(e)}
                                    />
                                </div>
                                <div className="flex flex-col border rounded-md p-4">
                                    <label htmlFor="confirmPassword" className="text-violet-300 mb-2">Confirmer le nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        disabled={canNotWrite} 
                                        className={`input-style border-b border-b-violet-300`}
                                        value={form.confirmNewPassword}
                                        name="confirmNewPassword"
                                        onChange={(e) => handleChange(e)}
                                    />
                                </div>
                            </>
                        }
                        <div className="flex flex-col border rounded-md p-4">
                            <label htmlFor="avatarUrl" className="text-violet-300 mb-2">Nouvel avatar (url https)</label>
                            <input 
                                type="text" 
                                id="avatarUrl" 
                                disabled={canNotWrite}
                                className='input-style border-b border-b-violet-300'
                                value={form.avatar}
                                name="avatar"
                                onChange={(e) => handleChange(e)}
                            />
                        </div>
                    </>
            }
            <button onClick={activateForm} className='button text-white'>
                {canNotWrite ? 'Modifier' : 'Confirmer'}
            </button>
            {/* bouton annulé */}
        </section>
    )
}