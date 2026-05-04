import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type SearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function Search({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
}: SearchProps) {
  return (
    <div
      className={`p-3 border-b border-zinc-200 dark:border-zinc-700 ${className}`}
    >
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg px-3 py-2">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-gray-400 dark:text-zinc-400 text-sm"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none text-sm w-full text-gray-700 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500"
        />
      </div>
    </div>
  );
}

export default Search;
