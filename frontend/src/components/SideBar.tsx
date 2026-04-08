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
  const displayName = user.pseudo?.trim() || "Profil";
  const userInitial = displayName.charAt(0).toUpperCase();
  const hasAvatar = typeof user.avatarUrl === "string" && user.avatarUrl.trim().length > 0;

  const userAvatar = hasAvatar ? (
    <img
      src={user.avatarUrl}
      alt={`${displayName} avatar`}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center font-semibold">
      {userInitial}
    </div>
  );

  const miniUserAvatar = hasAvatar ? (
    <img
      src={user.avatarUrl}
      alt={`${displayName} avatar`}
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-semibold">
      {userInitial}
    </div>
  );

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
      <footer className={`p-4`}>
        <div className="global-hover cursor-pointer">
          {isSmallMenu ? (
            <Link to={"/profil"}>{miniUserAvatar}</Link>
          ) : (
            <Link to={"/profil"}>
              <div className="flex items-center gap-2">
                {userAvatar} <p>{displayName}</p>
              </div>
            </Link>
          )}
        </div>

        <button onClick={handleLogout} className="warning-hover">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </button>
      </footer>
    </section>
  );
}
