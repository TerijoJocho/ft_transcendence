import { Outlet } from "react-router-dom";
import SideBar from "./components/SideBar.js";

export default function PrivateLayout() {
    return (
        <div className="flex min-h-screen min-w-screen">
            <SideBar />
            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}