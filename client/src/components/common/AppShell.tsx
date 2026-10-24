import { Compass } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "./Button";

export function AppShell() {
  const { profile, user, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/app" className="flex items-center gap-2 font-display text-xl">
            <Compass className="h-5 w-5 text-clay" />
            Daytrail
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <NavLink
              to="/app"
              end
              className={({ isActive }) => (isActive ? "text-pine" : "text-ink/70 hover:text-ink")}
            >
              Trips
            </NavLink>
            <NavLink
              to="/app/profile"
              className={({ isActive }) => (isActive ? "text-pine font-medium" : "text-ink/70 hover:text-ink")}
            >
              Preferences
            </NavLink>
            <NavLink
              to="/app/history"
              className={({ isActive }) => (isActive ? "text-pine font-medium" : "text-ink/70 hover:text-ink")}
            >
              AI History
            </NavLink>
            <span className="hidden text-ink/50 sm:inline">{profile?.full_name || user?.email}</span>

            <Button variant="ghost" onClick={() => void signOut()}>
              Sign out
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
