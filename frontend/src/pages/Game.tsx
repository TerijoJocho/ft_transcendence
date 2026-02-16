import Header from "../components/Header.tsx";

function Game() {
    return (
        <div className="text-white border">
            <Header 
                title="Démarrez une partie !"
            />

            <section className="flex justify-evenly">
                <button className="p-4 bg-white rounded-md text-black hover:bg-slate-300">
                    Joueur vs IA
                </button>
                <button className="p-4 bg-white rounded-md text-black hover:bg-slate-300">
                    Joueur vs Joueur
                </button>
            </section>
        </div>
    );
}

export default Game;