import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faChevronLeft,
  faArrowRightFromBracket,
  faBars,
  faCircleUser,
} from "@fortawesome/free-solid-svg-icons";
import { sideBarData } from "../data/sideBarData"; //friendsData a enlever
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../hooks/useFriends.ts";
import statusData from "../data/statusData.ts";

export default function SideBar() {
  const {friendsList} = useFriends();
  const { logout } = useAuth();
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

        {/* liste des amis favoris */}
        <div className={`${isSmallMenu ? "" : "border rounded-lg"}`}>
          {isSmallMenu ? (
            <Link to="/friends">
              <FontAwesomeIcon icon={faUserGroup} className="global-hover" />
            </Link>
          ) : (
            <>
              <h2 className="text-sm text-gray-400 mb-2 p-2">
                <Link to="/friends">
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    className="mr-1 hover:text-violet-400 cursor-pointer"
                  />
                </Link>
                Amis favoris
              </h2>
              <div className="max-h-52 overflow-y-auto space-y-6 p-2">
                {friendsList.length === 0 ? (
                  <div className="text-sm text-gray-400">
                    Aucun amis en favoris
                  </div>
                ) : (
                  friendsList.map((friend) => {
                    const friendStatus = statusData.find(
                      (st) => st.value === friend.status,
                    );
                    if (friend.isFavFriend)
                      return (
                        <div
                          key={friend.id}
                          className="flex items-center text-md justify-between"
                        >
                          <div className="self-start">
                            {/* remplacer par les vraies avatar */}
                            <FontAwesomeIcon icon={faCircleUser} />
                            {friend.pseudo}
                          </div>
                          <div
                            className={`h-2 w-2 rounded-full border ${friendStatus?.dotClass}`}
                          ></div>
                        </div>
                      );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* footer pour cliquer sur la page de profil et se logout */}
      <footer
        className={`flex items-center justify-between ${isSmallMenu ? "gap-2" : ""} p-4`}
      >
        <Link to={"/profil"}>
          {isSmallMenu ? (
            <FontAwesomeIcon
              icon={faCircleUser}
              className="global-hover cursor-pointer"
            />
          ) : (
            <div className="flex items-center global-hover cursor-pointer">
              <FontAwesomeIcon icon={faCircleUser} />
              <p>Pseudo</p>
            </div>
          )}
        </Link>
        <button onClick={handleLogout}>
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            className="warning-hover"
          />
        </button>
      </footer>
    </section>
  );
}
