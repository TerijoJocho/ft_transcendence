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
  const displayName = user.pseudo.length > 6 ? <p>{user.pseudo.slice(0,6) + '...'}</p> : user.pseudo

  return (
    <>
      {/* Bouton hamburger sur mobile */}
      <button
        className={`lg:hidden fixed top-4 left-4 z-50 bg-gray-700 text-white p-2 rounded ${!isSmallMenu && isMobileOpen && 'hidden'}`}
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
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            transition-transform duration-300
            ${isSmallMenu ? 'w-24 items-center' : 'w-56'}
            bg-gray-700 text-white flex flex-col p-4
          `}
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
          {!isMobileOpen ? 
            (<button onClick={toggleMenu} className="cursor-pointer">
              {isSmallMenu ? (
                <FontAwesomeIcon icon={faBars} className="global-hover" />
              ) : (
                <FontAwesomeIcon icon={faChevronLeft} className="global-hover" />
              )}
            </button>)
            :
            (<button onClick={() => setIsMobileOpen(false)} className="cursor-pointer">
              <FontAwesomeIcon icon={faChevronLeft} className="global-hover" />
            </button>)
          }
        </header>

        <nav className="flex flex-col gap-8 p-6 flex-1 overflow-hidden border-b border-gray-600">
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
                <span className={isSmallMenu ? "hidden" : ""}>
                  {data.text}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* footer pour cliquer sur la page de profile et se logout */}
        <footer className={`flex w-full ${isSmallMenu ? "justify-center" : "justify-between"}`}>
          <Link to={"/profil"} className="global-hover">
            <div className="flex gap-2 items-center" onClick={() => setIsMobileOpen(false)}>
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
      </section>
    </>
  );
}
