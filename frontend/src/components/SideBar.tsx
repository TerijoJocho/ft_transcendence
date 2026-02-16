import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUserGroup ,faChevronLeft, faArrowRightFromBracket, faBars} from '@fortawesome/free-solid-svg-icons';
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

    return (
        <div className={`h-screen ${isSmallMenu ? "w-24 items-center" : "w-56"} bg-gray-900 text-white flex flex-col p-4`}>

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

            <nav className={`flex flex-col gap-12 p-6 flex-1`}>
                {
                    sideBarData.map((data, index) => {
                        return (
                            <Link to={data.path} key={index} className='flex items-center gap-10 text-xl tracking-wide font-medium global-hover'>
                                <FontAwesomeIcon icon={data.icon}/>
                                <span className={`${isSmallMenu ? "hidden" : "md:inline"}`}>{data.text}</span>
                            </Link>
                        )
                    })
                }

                <div className={`flex-1 ${isSmallMenu ? "" : "border rounded-lg"}`}>
                    {isSmallMenu ? 
                        <FontAwesomeIcon icon={faUserGroup}/>
                        :
                        <>
                            <h2 className="text-sm text-gray-400 mb-2 p-2">Amis connectés</h2>
                            <div className="max-h-40 overflow-y-auto space-y-6 p-2">
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

            <div className='flex items-center justify-between border-t border-gray-600 p-4'>
                {
                    isSmallMenu ? 
                        <p>avatar</p> 
                        : 
                        <p>avatar + pseudo + </p> 
                }
                <button onClick={handleLogout}>
                   <FontAwesomeIcon icon={faArrowRightFromBracket} className='hover:text-red-500'/>
                </button>
            </div>
        </div>
    )
}