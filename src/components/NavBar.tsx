import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getBaseUrl } from "../utils/baseUrl";

const NAV_ITEMS = [
  { label: "News",         path: "/" },
  { label: "Players",      path: "/players" },
  { label: "Retired",      path: "/retired_players" },
  { label: "Top Scorers",  path: "/scorers" },
  { label: "Matches",      path: "/matches" },
  { label: "Jersey",       path: "/jersey" },
  { label: "Moments",      path: "/moments" },
  { label: "Discussion",   path: "/discussion" },
];

export function NavBar() {
  const base = getBaseUrl();
  const [open, setOpen] = useState(false);
  const { player, loading, logout } = useAuth();

  async function handleLogout() {
    await logout();
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-ink text-white border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
        {/* 左：logo + 名 */}
        <NavLink to="/" className="flex items-center gap-3 shrink-0">
          <img
            src={`${base}assets/logo.png`}
            alt="Shuli"
            className="w-9 h-9 object-contain rounded-full ring-2 ring-brand-500"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg tracking-wider">SHULI FC</span>
            <span className="text-[10px] text-white/60 tracking-[0.2em] uppercase">
              树礼书院足球队
            </span>
          </div>
        </NavLink>

        {/* 中：桌面导航 */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                [
                  "relative px-2.5 lg:px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors",
                  isActive ? "text-brand-400" : "text-white/80 hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={[
                      "absolute left-2 right-2 -bottom-0.5 h-0.5 bg-brand-500 transition-transform",
                      isActive ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 右：CTA + 移动菜单按钮 */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline-block text-xs text-white/60 tracking-widest uppercase">
            2025/26 Season
          </span>
          {!loading && player && (
            <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-4">
              {player.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-400 hover:text-brand-300"
                >
                  Admin
                </NavLink>
              )}
              <span className="text-xs text-white/70">
                {player.username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
          {!loading && !player && (
            <NavLink
              to="/login"
              className="hidden lg:inline-flex px-3 py-2 bg-brand-500 text-ink text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-brand-400"
            >
              Login
            </NavLink>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动菜单 */}
      {open && (
        <nav className="md:hidden bg-ink-soft border-t border-white/10">
          <ul className="px-4 py-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block px-2 py-3 text-sm font-semibold uppercase tracking-wider border-l-2",
                      isActive
                        ? "border-brand-500 text-brand-400"
                        : "border-transparent text-white/80",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="border-t border-white/10 mt-2 pt-2">
              {!loading && player?.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block px-2 py-3 text-sm font-semibold uppercase tracking-wider border-l-2",
                      isActive
                        ? "border-brand-500 text-brand-400"
                        : "border-transparent text-brand-400",
                    ].join(" ")
                  }
                >
                  Admin
                </NavLink>
              )}
              {!loading && player && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-2 py-3 text-sm font-semibold uppercase tracking-wider text-white/80"
                >
                  Logout · {player.username}
                </button>
              )}
              {!loading && !player && (
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block px-2 py-3 text-sm font-semibold uppercase tracking-wider border-l-2",
                      isActive
                        ? "border-brand-500 text-brand-400"
                        : "border-transparent text-white/80",
                    ].join(" ")
                  }
                >
                  Login
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
