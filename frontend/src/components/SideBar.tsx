import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faArrowRightFromBracket,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { sideBarData } from "../data/sideBarData";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function SideBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSmallMenu, setIsSmallMenu] = useState(false);

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
  const displayName = user.pseudo.length > 6 ? <p>{user.pseudo.slice(0,6) + '...'}</p> : user.pseudo

  return (
    <section
      className={`sticky top-0 h-screen ${isSmallMenu ? "w-24 items-center" : "w-56"} bg-gray-700 text-white flex flex-col p-4 transition-all duration-200`}
    >
      <header
        className={`${isSmallMenu ? "" : "flex justify-between items-center"} border-b border-gray-600 p-3 mb-4`}
      >
        {!isSmallMenu && (
          <span
            className={`${isSmallMenu ? "text-sm" : "text-xl"} font-bold cursor-default`}
          >
            ChessWar
          </span>
        )}
        <button onClick={toggleMenu} className="cursor-pointer">
          {isSmallMenu ? (
            <FontAwesomeIcon icon={faBars} className="global-hover" />
          ) : (
            <FontAwesomeIcon icon={faChevronLeft} className="global-hover" />
          )}
        </button>
      </header>

      <nav
        className={`flex flex-col gap-8 p-6 flex-1 overflow-hidden border-b border-gray-600`}
      >
        {/* liens verrs les autres pages */}
        {sideBarData.map((data, index) => {
          return (
            <Link
              to={data.path}
              key={index}
              className="flex items-center gap-6 text-xl tracking-wide font-medium global-hover"
            >
              <FontAwesomeIcon icon={data.icon} />
              <span className={`${isSmallMenu ? "hidden" : "md:inline"}`}>
                {data.text}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* footer pour cliquer sur la page de profile et se logout */}
      <footer className={`flex w-full ${isSmallMenu ? "justify-center" : "justify-between"}`}>
        <Link to={"/profil"} className="global-hover">
          <div className={`flex gap-2 items-center`}>
            <img
              src={user.avatarUrl}
              alt={`${user.pseudo} avatar`}
              className={`rounded-full object-cover ${isSmallMenu ? "w-8 h-8" : "w-12 h-12"}`}
            />
            {!isSmallMenu && displayName}
          </div>
        </Link>

        {!isSmallMenu && (
          <button onClick={handleLogout} className="warning-hover ml-2">
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>
        )}
      </footer>

      {!isSmallMenu && (
        <div className="mt-4 pt-3 border-t border-gray-600 text-xs flex flex-col gap-1">
          <Link to="/privacy-policy" className="hover:underline text-gray-300">
            Politique de confidentialité
          </Link>
          <Link to="/terms-of-service" className="hover:underline text-gray-300">
            Conditions d'utilisation
          </Link>
        </div>
      )}
    </section>
  );
}
