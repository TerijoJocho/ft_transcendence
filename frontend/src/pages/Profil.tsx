import Header from "../components/Header.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import ProfileInfos from "../components/ProfileInfos.tsx";
import DeleteAccountModal from "../components/DeleteAccountModal.tsx";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth.ts";
import * as api from "../api/api.ts";
import { isValidMail } from "../utils/isValidMail.ts";

import { Checkbox } from "primereact/checkbox";

function Profil() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    newPassword: "",
    confirmNewPassword: "",
    avatar: "",
  });
  const initialForm = useMemo(
    () => ({
      id: user.id,
      pseudo: user.pseudo,
      email: user.email,
      newPassword: "",
      confirmNewPassword: "",
      avatar: "",
    }),
    [user.id, user.pseudo, user.email],
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "pending" | "success" | "error";
  } | null>(null);
  const [deleteInput, setDeleteInput] = useState<string>("");
  const CONFIRM_PHRASE = `Je confirme vouloir supprimer mon compte: ${user.pseudo}`;
  const [wantToDelete, setWantToDelete] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);

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
      setForm((prev) => ({ ...prev, pseudo: user.pseudo }));
      setFeedback({ message: "Mauvais pseudo", type: "error" });
      return;
    }

    if (!resValidMail) {
      setForm((prev) => ({ ...prev, email: user.email }));
      setFeedback({ message: "Mauvais email", type: "error" });
      return;
    }

    if (isPasswordChange && !isPasswordValid) {
      setForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmNewPassword: "",
      }));
      setFeedback({ message: "Mot de passe invalide", type: "error" });
      return;
    }

    const hasChanges =
      form.pseudo.trim() !== initialForm.pseudo.trim() ||
      form.email.trim() !== initialForm.email.trim() ||
      form.avatar !== initialForm.avatar ||
      form.newPassword.length > 0 ||
      form.confirmNewPassword.length > 0;

    if (!hasChanges) {
      setFeedback({ message: "Aucun changement detecte", type: "pending" });
      return;
    }

    setFeedback({ message: "Chargement", type: "pending" });
    api
      .updateProfile(form)
      .then(() => {
        setFeedback({ message: "Changement effectué", type: "success" });
      })
      .catch((e) =>
        setFeedback({
          message: e instanceof Error ? e.message : String(e),
          type: "error",
        }),
      )
      .finally(() =>
        setForm((prev) => ({
          ...prev,
          newPassword: "",
          confirmNewPassword: "",
        })),
      );

    setTimeout(() => window.location.reload(), 1000);
  }

  function handleDelete() {
    if (deleteInput !== CONFIRM_PHRASE) {
      setDeleteInput("");
      setFeedback({
        message: "Veuillez écrire la bonne phrase",
        type: "error",
      });
      return;
    }

    api
      .deleteAccount()
      .then(() =>
        setFeedback({
          message: "Votre compte a été supprimé.",
          type: "success",
        }),
      )
      .catch((e) =>
        setFeedback({
          message: e instanceof Error ? e.message : String(e),
          type: "error",
        }),
      )
      .finally(() => (setWantToDelete(false), setDeleteInput("")));
  }

  const isPasswordChange =
    form.newPassword.length > 0 || form.confirmNewPassword.length > 0;
  const isPasswordValid =
    form.newPassword === form.confirmNewPassword ||
    form.newPassword.length >= 8;
  const isUsernameValid = form.pseudo?.length >= 4;
  const resValidMail = isValidMail(form.email);

  return (
    <div className="border rounded-md bg-white text-black h-full relative">
      <Header title="Page de profil" />
      <div className="flex flex-col items-center gap-12">
        <ProfileHeader user={user} />
        <ProfileInfos
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          user={user}
        />
        <div className="w-full flex justify-between items-center">
          <div className="card flex justify-content-center">
            <label htmlFor="2FA">
              Activer la double authentification (2FA)
            </label>
            <Checkbox
              inputId="2FA"
              onChange={(e) => setChecked(e.checked)}
              checked={checked}
            ></Checkbox>
          </div>
          <button
            className="m-2 bg-red-600 text-white warning-hover hover:bg-white"
            onClick={() => setWantToDelete(true)}
          >
            Supprimer le compte
          </button>
        </div>
        {feedback?.message && (
          <span
            className={`z-50 fixed top-10 right-10 py-2 px-6 ${feedback.type === "success" ? "text-green-500" : feedback.type === "error" ? "text-red-500" : "text-white"} bg-black/50 backdrop-blur-md rounded-md`}
          >
            {feedback.message}
          </span>
        )}
      </div>
      {wantToDelete && (
        <DeleteAccountModal
          setWantToDelete={setWantToDelete}
          deleteInput={deleteInput}
          setDeleteInput={setDeleteInput}
          CONFIRM_PHRASE={CONFIRM_PHRASE}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Profil;
