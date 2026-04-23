import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar.tsx";
import { ChatProvider } from "../hooks/useChat.tsx";

export default function PrivateLayout() {
  return (
    <ChatProvider>
      <div className="flex min-h-screen">
        <SideBar />
        <main className="flex-1 p-6 border">
          <Outlet />
        </main>
      </div>
    </ChatProvider>
  );
}
