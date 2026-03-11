import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="flex min-h-screen justify-center items-center bg-[url(bg_all.jpg)] bg-no-repeat bg-cover">
            <main className="w-full max-w-lg px-4">
                <Outlet />
            </main>
        </div>
    );
}