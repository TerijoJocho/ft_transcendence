import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar.tsx";
import { ChatProvider } from "../hooks/useChat.tsx";
import { PresenceProvider } from "../hooks/usePresence.tsx";
import { RealtimeSocketProvider } from "../hooks/useRealtimeSocket.tsx";

export default function PrivateLayout() {
  return (
    <RealtimeSocketProvider>
      <PresenceProvider>
        <ChatProvider>
          <div className="flex min-h-screen">
            <SideBar />
            <main className="flex-1 p-4 lg:p-6 border border-gray-200 dark:border-zinc-800 transition-colors duration-300">
              <Outlet />
            </main>
          </div>
        </ChatProvider>
      </PresenceProvider>
    </RealtimeSocketProvider>
  );
}
