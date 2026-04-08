import Header from "../components/Header.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import ProfileInfos from "../components/ProfileInfos.tsx";
import DeleteAccountModal from "../components/DeleteAccountModal.tsx";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth.ts";
import * as api from "../api/api.ts";
import { isValidMail } from "../utils/isValidMail.ts";

function Profil() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    pseudo: user.pseudo,
    email: user.email,
    newPassword: "",
    confirmNewPassword: "",
    avatar: "",
  });
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "pending" | "success" | "error";
  } | null>(null);
  const [deleteInput, setDeleteInput] = useState<string>("");
  const CONFIRM_PHRASE = `Je confirme vouloir supprimer mon compte: ${user.pseudo}`;
  const [wantToDelete, setWantToDelete] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!isUsernameValid) {
      setFeedback({ message: "Mauvais pseudo", type: "error" });
      return;
    }
    if (!resValidMail) {
      setFeedback({ message: "Mauvais email", type: "error" });
      return;
    }
    if (isPasswordChanged && !isPasswordValid) {
      setFeedback({ message: "Mot de passe invalide", type: "error" });
      return;
    }
    setFeedback({ message: "Chargement", type: "pending" });
    api
      .updateProfile(form)
      .then(() =>
        setFeedback({ message: "Changement effectué", type: "success" }),
      )
      .catch((e) =>
        setFeedback({
          message: e instanceof Error ? e.message : String(e),
          type: "error",
        }),
      );

    console.log(form);
  }

  function handleDelete() {
    api.deleteAccount()
      .catch((e) =>
        setFeedback({
          message: e instanceof Error ? e.message : String(e),
          type: "error",
        }),
      )
      .finally(
        () => (
          setWantToDelete(false),
          setDeleteInput(""),
          setPasswordInput("")
        ),
      );
  }

  const isPasswordChanged = form.newPassword.length > 0 && form.confirmNewPassword.length > 0;
  const isPasswordValid = form.newPassword === form.confirmNewPassword && form.newPassword.length >= 8;
  const isUsernameValid = form.pseudo.length >= 4;
  const resValidMail = isValidMail(form.email);

  return (
    <div className="border rounded-md bg-white text-black h-full relative">
      <Header title="Page de profil" />
      <div className="flex flex-col items-center gap-12">
        <ProfileHeader />
        <ProfileInfos
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
        <DeleteAccountModal setWantToDelete={setWantToDelete} />
        {feedback?.message && (
          <span
            className={`fixed top-10 right-10 py-2 px-6 ${feedback.type === "success" ? "text-green-500" : feedback.type === "error" ? "text-red-500" : "text-white"} bg-black/50 backdrop-blur-md rounded-md`}
          >
            {feedback.message}
          </span>
        )}
      </div>
      {wantToDelete && (
        <div className="z-50 bg-black/50 backdrop-blur-sm text-white fixed top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 flex flex-col items-center justify-center p-2 rounded-md h-[90%] w-fit">
          <p className="p-3 text-lg">
            Afin de supprimer votre compte veuillez indiquer votre mote de passe
            ainsi qu'écrire la phrase ci-dessous:
          </p>
          <label htmlFor="password" className="mb-3 text-lg">
            Mot de passe?
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="rounded-sm p-2 text-black w-fit"
          />
          <label
            htmlFor="delete"
            className="mb-3 mt-6 text-lg"
          >{`\"${CONFIRM_PHRASE}\"`}</label>
          <input
            id="delete"
            type="text"
            name="delete"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            className="rounded-sm p-2 text-black w-fit"
          />
          <div className="flex justify-between mt-2">
            <button
              className="p-4 m-2 bg-white text-red-500 w-fit rounded-md self-center"
              onClick={() => (
                setWantToDelete(false),
                setDeleteInput(""),
                setPasswordInput("")
              )}
            >
              Annuler
            </button>
            <button
              className="p-4 m-2 bg-green-400 text-white-500 w-fit rounded-md self-center"
              onClick={handleDelete}
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profil;
