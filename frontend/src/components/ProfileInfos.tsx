import { type ChangeEvent, useState } from "react";
import { type User } from "../auth/core/authCore.ts";
import { isValidMail } from "../utils/isValidMail.ts";
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
  hasTouched: boolean;
  handleSubmit: () => void;
  user: User;
  passwordRulesText: string;
  isLoading: boolean;
}
export default function ProfileInfos({
  form,
  handleChange,
  hasTouched,
  handleSubmit,
  user,
  passwordRulesText,
  isLoading,
}: ProfileInfosProps) {
  const [canNotWrite, setCanNotWrite] = useState<boolean>(true);

  function activateForm() {
    if (isLoading) return;
    setCanNotWrite((prev) => !prev);
    if (!canNotWrite) handleSubmit();
  }
  return (
    <section className="flex flex-col gap-6 mx-4">
      <div className="flex flex-col border dark:border-zinc-700 rounded-md p-2">
        <label
          htmlFor="username"
          className="text-violet-300 dark:text-yellow-400 mb-2"
        >
          Pseudo
        </label>
        <input
          type="text"
          id="username"
          disabled={canNotWrite || isLoading}
          className="input-style border-b border-b-violet-300"
          value={form.pseudo}
          name="pseudo"
          onChange={(e) => handleChange(e)}
        />
      </div>

      {
        hasTouched && form.pseudo.length > 8 && (
            <span className="error-style">Le pseudo ne doit pas dépasser 8 caractères</span> 
        )
      }

      {
        hasTouched && form.pseudo.length > 0 && form.pseudo.length < 4 && (
          <span className="error-style">Le pseudo doit faire au moins 4 caractères</span> 
        )
      }

      <div className="flex flex-col border dark:border-zinc-700 rounded-md p-4">
        <label
          htmlFor="email"
          className="text-violet-300 dark:text-yellow-400 mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          disabled={user.isGoogleUser ? true : canNotWrite || isLoading}
          className={`input-style border-b border-b-violet-300 ${user.isGoogleUser ? "cursor-not-allowed" : ""}`}
          value={form.email}
          name="email"
          onChange={(e) => handleChange(e)}
        />
      </div>

      {
        hasTouched && form.email.length > 0 && !isValidMail(form.email) && (
        <span className="error-style">Email invalide</span>
      )}
      
      {
        hasTouched && form.email.length > 30 && (
          <span className="error-style">L'email ne doit pas dépasser 30 caractères</span> 
        )
      }

      {!canNotWrite && (
        <>
          {!user.isGoogleUser && (
            <>
              <div className="flex flex-col border dark:border-zinc-700 rounded-md p-4">
                <label
                  htmlFor="password"
                  className="text-violet-300 dark:text-yellow-400 mb-2"
                >
                  Nouveau mot de passe
                </label>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
                  {passwordRulesText}
                </p>
                <input
                  type="password"
                  id="password"
                  disabled={canNotWrite || isLoading}
                  className="input-style border-b border-b-violet-300"
                  value={form.newPassword}
                  name="newPassword"
                  onChange={(e) => handleChange(e)}
                />
              </div>
              <div className="flex flex-col border dark:border-zinc-700 rounded-md p-4">
                <label
                  htmlFor="confirmPassword"
                  className="text-violet-300 dark:text-yellow-400 mb-2"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  disabled={canNotWrite || isLoading}
                  className={`input-style border-b border-b-violet-300`}
                  value={form.confirmNewPassword}
                  name="confirmNewPassword"
                  onChange={(e) => handleChange(e)}
                />
              </div>
            </>
          )}
          <div className="flex flex-col border dark:border-zinc-700 rounded-md p-4">
            <label
              htmlFor="avatarUrl"
              className="text-violet-300 dark:text-yellow-400 mb-2"
            >
              Nouvel avatar (url https ; verifiez que votre url correspond a une image)
            </label>
            <input
              type="text"
              id="avatarUrl"
              disabled={canNotWrite || isLoading}
              className="input-style border-b border-b-violet-300"
              value={form.avatar}
              name="avatar"
              onChange={(e) => handleChange(e)}
            />
          </div>

          {
            hasTouched && form.avatar.length > 2049 && (
              <span className="error-style">L'url ne doit pas dépasser 2048 caractères</span> 
            )
          }
        </>
      )}
      <button
        onClick={activateForm}
        className="button text-white"
        disabled={isLoading}
      >
        {canNotWrite ? "Modifier" : "Confirmer"}
      </button>
    </section>
  );
}
