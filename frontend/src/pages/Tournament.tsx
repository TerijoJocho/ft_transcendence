import Header from "../components/Header.tsx";

function Tournament() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-black dark:text-slate-100 w-full min-w-0 transition-colors duration-300">
      <Header title="Tournois disponible" />
    </div>
  );
}

export default Tournament;
