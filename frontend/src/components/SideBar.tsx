import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserGroup,
    faChevronLeft,
    faArrowRightFromBracket,
    faBars,
    faCircleUser,
} from '@fortawesome/free-solid-svg-icons';
import sideBarData from '../data/sideBarData';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";


export default function SideBar() {
    const {clearAuth} = useAuth();
    const navigate = useNavigate();
    const [isSmallMenu, setIsSmallMenu] = useState(false);

     async function handleLogout() {
        try {
            await clearAuth();
        } catch (error) {
            console.log(error);
        } finally {
            navigate("/login");
        }
    }

    const toggleMenu = () => setIsSmallMenu(prev => !prev);

    /*requete /me ou /user idk, pour recuperer : username, avatar, liste d'amis*/

    return (
        <section className={`sticky top-0 h-screen ${isSmallMenu ? "w-24 items-center" : "w-56"} bg-gray-700 text-white flex flex-col p-4 transition-all duration-200`}>

            <header className={`${isSmallMenu ? "" : "flex justify-between items-center"} border-b border-gray-600 p-3 mb-4`}>
                {!isSmallMenu && 
                    <span className={`${isSmallMenu ? "text-sm" : "text-xl"} font-bold cursor-default`}>
                        ChessWar
                    </span>
                }
                <button onClick={toggleMenu} className='cursor-pointer'>
                    {isSmallMenu ? 
                        <FontAwesomeIcon icon={faBars} className='global-hover'/>
                        :
                        <FontAwesomeIcon icon={faChevronLeft} className='global-hover'/>
                    }
                </button>
            </header>

            <nav className={`flex flex-col gap-8 p-6 flex-1 overflow-hidden border-b border-gray-600`}>
                {/* liens verrs les autres pages */}
                {
                    sideBarData.map((data, index) => {
                        return (
                            <Link to={data.path} key={index} className='flex items-center gap-6 text-xl tracking-wide font-medium global-hover'>
                                <FontAwesomeIcon icon={data.icon}/>
                                <span className={`${isSmallMenu ? "hidden" : "md:inline"}`}>{data.text}</span>
                            </Link>
                        )
                    })
                }

                {/* liste des amis connectés */}
                <div className={`${isSmallMenu ? "" : "border rounded-lg"}`}>
                    {isSmallMenu ? 
                        <Link to="/friends">
                            <FontAwesomeIcon icon={faUserGroup} className='global-hover'/>
                        </Link>
                        :
                        <>                            
                            <h2 className="text-sm text-gray-400 mb-2 p-2">
                                <Link to="/friends">
                                    <FontAwesomeIcon icon={faUserGroup} className='mr-1 hover:text-violet-400 cursor-pointer'/>
                                </Link>
                                Amis connectés
                            </h2>
                            <div className="max-h-52 overflow-y-auto space-y-6 p-2">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="text-sm">
                                Ami {i + 1}
                                </div>
                            ))}
                            </div>
                        </>
                    }

                </div>
            </nav>
            
            {/* footer pour cliquer sur la page de profil et se logout */}
            <footer className={`flex items-center justify-between ${isSmallMenu ? "gap-2" : ""} p-4`}>
                <Link to={"/profil"} >
                    {
                        isSmallMenu ? 
                            <FontAwesomeIcon icon={faCircleUser} className='global-hover cursor-pointer'/> 
                            :
                            <div className='flex items-center global-hover cursor-pointer'>
                                <FontAwesomeIcon icon={faCircleUser}/> 
                                <p>Pseudo</p>
                            </div>
                    }
                </Link>
                <button onClick={handleLogout}>
                   <FontAwesomeIcon icon={faArrowRightFromBracket} className='warning-hover'/>
                </button>
            </footer>
        </section>
    )
}