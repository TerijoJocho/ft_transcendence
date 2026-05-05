import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faArrowRightFromBracket,
  faBars,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { sideBarData } from "../data/sideBarData";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext.tsx";

export default function SideBar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSmallMenu, setIsSmallMenu] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/login");
    }
  }

  const toggleMenu = () => setIsSmallMenu((prev) => !prev);
  const displayName =
    user.pseudo.length > 6 ? (
      <p>{user.pseudo.slice(0, 6) + "..."}</p>
    ) : (
      user.pseudo
    );

  return (
    <>
      {/* Bouton hamburger sur mobile */}
      <button
        className={`lg:hidden fixed top-4 left-4 z-50 bg-gray-700 dark:bg-zinc-900 text-white p-2 rounded ${!isSmallMenu && isMobileOpen && "hidden"}`}
        onClick={() => {
          setIsMobileOpen(true);
          setIsSmallMenu(false);
        }}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Overlay sombre sur mobile quand ouvert */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* La sidebar  */}
      <section
        className={`
            fixed lg:sticky top-0 h-screen z-40
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            transition-transform duration-300
            ${isSmallMenu ? "w-24 items-center" : "w-56"}
            bg-gray-500 dark:bg-zinc-900 text-white flex flex-col p-4 overflow-y-auto
            
          `}
      >
        <header
          className={`${isSmallMenu ? "" : "flex justify-between items-center"} border-b border-gray-400 dark:border-zinc-500 p-3 mb-4`}
        >
          {!isSmallMenu && (
            <span
              className={`${isSmallMenu ? "text-sm" : "text-xl"} font-bold cursor-default`}
            >
              ChessWar
            </span>
          )}
          {!isMobileOpen ? (
            <button onClick={toggleMenu} className="cursor-pointer">
              {isSmallMenu ? (
                <FontAwesomeIcon icon={faBars} className="global-hover" />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="global-hover"
                />
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="global-hover" />
            </button>
          )}
        </header>

        <nav className="flex flex-col gap-8 p-6 flex-1 min-h-0 overflow-y-auto border-b border-gray-400 dark:border-zinc-500">
          {/* liens verrs les autres pages */}
          {sideBarData.map((data, index) => {
            return (
              <Link
                to={data.path}
                key={index}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-6 text-xl tracking-wide font-medium global-hover"
              >
                <FontAwesomeIcon icon={data.icon} />
                <span className={isSmallMenu ? "hidden" : ""}>{data.text}</span>
              </Link>
            );
          })}
        </nav>

        {/* footer pour cliquer sur la page de profile et se logout */}
        <footer
          className={`flex flex-col w-full shrink-0 ${isSmallMenu ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center justify-between gap-2">
            <Link to={"/profil"} className="global-hover flex-1">
              <div
                className="flex gap-2 items-center"
                onClick={() => setIsMobileOpen(false)}
              >
                <img
                  src={user.avatarUrl}
                  alt={`${user.pseudo} avatar`}
                  className={`rounded-full object-cover ${isSmallMenu ? "w-8 h-8" : "w-12 h-12"} border border-violet-400 dark:border-yellow-700`}
                />
                {!isSmallMenu && displayName}
              </div>
            </Link>

            {!isSmallMenu && (
              <button onClick={handleLogout} className="warning-hover ml-2">
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`mt-4 flex items-center ${isSmallMenu ? "justify-center" : "justify-between"} gap-2 rounded-md border border-gray-400 dark:border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-700 dark:hover:bg-violet-300 transition-colors`}
            aria-label="Basculer le mode jour/nuit"
            title="Basculer le mode jour/nuit"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
              {!isSmallMenu && (
                <span>{isDark ? "Mode jour" : "Mode nuit"}</span>
              )}
            </span>
            {!isSmallMenu && <span className="text-xs opacity-80">On/Off</span>}
          </button>

          {!isSmallMenu && (
            <div className="mt-4 pt-3 border-gray-600 dark:border-zinc-700 text-xs flex flex-col gap-1">
              <Link to="/privacy-policy" className="hover:underline text-white">
                Politique de confidentialité
              </Link>
              <Link
                to="/terms-of-service"
                className="hover:underline text-white"
              >
                Conditions d'utilisation
              </Link>
            </div>
          )}
        </footer>
      </section>
    </>
  );
}
