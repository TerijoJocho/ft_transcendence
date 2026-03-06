import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="flex min-h-screen justify-center items-center">
            <main className="border border-pink-600">
                <Outlet />
            </main>
        </div>
    );
}