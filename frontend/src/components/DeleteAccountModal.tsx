import type { Dispatch, SetStateAction } from "react";

type DeleteAccountModalProps = {
  setWantToDelete: Dispatch<SetStateAction<boolean>>;
  deleteInput: string;
  setDeleteInput: Dispatch<SetStateAction<string>>;
  CONFIRM_PHRASE: string;
  handleDelete: () => void;
  isLoading: boolean;
};

export default function DeleteAccountModal({
  setWantToDelete,
  deleteInput,
  setDeleteInput,
  CONFIRM_PHRASE,
  handleDelete,
  isLoading,
}: DeleteAccountModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3">
      <div className="w-full max-w-md max-h-[90vh] overflow-auto rounded-md bg-black/70 text-white p-4">
        <p className="text-base sm:text-lg">
          Afin de supprimer votre compte veuillez ecrire la phrase de
          confirmation ci-dessous:
        </p>
        <label
          htmlFor="delete"
          className="block my-4 text-sm sm:text-base break-words"
        >
          {`"${CONFIRM_PHRASE}"`}
        </label>
        <input
          id="delete"
          type="text"
          name="delete"
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          className="input-style"
          disabled={isLoading}
        />
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 p-3 bg-white dark:bg-zinc-800 text-red-500 rounded-md"
            onClick={() => (setWantToDelete(false), setDeleteInput(""))}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            className="flex-1 p-3 bg-green-500 text-white rounded-md"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
