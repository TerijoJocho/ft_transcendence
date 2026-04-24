import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="relative flex min-h-screen justify-center items-center bg-[url('/bg_all.jpg')] bg-no-repeat bg-cover">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/55" />
      <main className="relative w-full max-w-lg px-4">
        <Outlet />
      </main>
    </div>
  );
}
