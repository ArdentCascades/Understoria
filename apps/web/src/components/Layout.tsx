import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { LockScreen } from "./LockScreen";
import { useApp } from "@/state/AppContext";

export function Layout() {
  const { ready, lockState } = useApp();
  const locked = lockState === "locked";
  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-md flex-col">
      <main className="flex-1 pb-20">
        {!ready ? (
          <Splash />
        ) : locked ? (
          <LockScreen />
        ) : (
          <Outlet />
        )}
      </main>
      {!locked && <BottomNav />}
    </div>
  );
}

function Splash() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-5xl" aria-hidden="true">
        {"\u{1F331}"}
      </div>
      <p className="text-moss-600 dark:text-moss-300">
        Growing your community...
      </p>
    </div>
  );
}
