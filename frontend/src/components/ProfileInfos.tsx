import { useState } from "react";

export default function ProfileInfos({form, handleChange, handleSubmit}) {
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
                    disabled={canNotWrite} 
                    className='input-style border-b border-b-violet-300'
                    value={form.email}
                    name="email"
                    onChange={(e) => handleChange(e)}
                /> 
            </div>
            {
                !canNotWrite &&
                    <>
                        <div className="flex flex-col border rounded-md p-4">
                            <label htmlFor="password" className="text-violet-300 mb-2">Nouveau mot de passe</label>
                            <input 
                                type="password" 
                                id="password" 
                                disabled={canNotWrite} 
                                className='input-style border-b border-b-violet-300'
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
                                className='input-style border-b border-b-violet-300'
                                value={form.confirmNewPassword}
                                name="confirmNewPassword"
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