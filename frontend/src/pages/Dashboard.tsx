import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

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
        <>
            <h1>Bienvenue sur le dashboard</h1>
            <button onClick={handleLogout}>Se déconnecter</button>
        </>
    );
}

export default Dashboard