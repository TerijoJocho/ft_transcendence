import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar.tsx";

export default function PrivateLayout() {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <main className="flex-1 p-4 lg:p-6 border">
        <Outlet />
      </main>
    </div>
  );
}
