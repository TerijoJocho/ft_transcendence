import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

import SideBar from "../components/SideBar.js";
import Header from "../components/Header.jsx";


function Dashboard() {
    const {clearAuth} = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await clearAuth();
        } catch (error) {
            console.log(error);
        } finally {
            navigate("/login");
        }
    }

    return (
        <div
            className="
                border
                text-white
                grid grid-flow-col grid-rows-2 gap-4
            "
        >
            {/* <Header 
                title="♔ Bienvenue sur ChessWar ! ♔"
            /> */}
            {/* à gerer dans le menu deroulant plutot */}
            {/* <button onClick={handleLogout}>Se déconnecter</button> */}
            <SideBar />

        </div>
    );
}

export default Dashboard