import { Outlet } from "react-router-dom";

export default function PrivateLayout() {
    return (
        <div className="min-h-screen flex justify-center items-center m-auto">
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}