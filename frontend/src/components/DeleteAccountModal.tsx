import type { Dispatch, SetStateAction } from "react";

type DeleteAccountModalProps = {
  setWantToDelete: Dispatch<SetStateAction<boolean>>;
  deleteInput: string;
  setDeleteInput: Dispatch<SetStateAction<string>>;
  CONFIRM_PHRASE: string;
  handleDelete: () => void;
};

export default function DeleteAccountModal({
  setWantToDelete,
  deleteInput,
  setDeleteInput,
  CONFIRM_PHRASE,
  handleDelete,
}: DeleteAccountModalProps) {
  return (
    <div className="z-49 bg-black/50 backdrop-blur-sm text-white fixed top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 flex flex-col items-center justify-center p-2 rounded-md h-[90%] w-fit">
      <p className="p-3 text-lg">
        Afin de supprimer votre compte veuillez écrire la phrase de confirmation ci-dessous:
      </p>
      <label
        htmlFor="delete"
        className="mb-3 mt-6 text-lg"
      >{`"${CONFIRM_PHRASE}"`}</label>
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
            setDeleteInput("")
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
  );
}
