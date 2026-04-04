export default function DeleteAccountModal({setWantToDelete}) {

    return(
        <section className="self-end">
            <button className="m-2 bg-red-600 text-white warning-hover hover:bg-white" onClick={() => setWantToDelete(true)}>
                Supprimer le compte
            </button>
        </section>
    )
}