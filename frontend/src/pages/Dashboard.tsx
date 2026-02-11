import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

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
        <div className="bg-red-500">
            <Header 
                title="Bienvenue sur ChessWar !"
            />
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
}

export default Dashboard