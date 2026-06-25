import { Link, NavLink } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../../auth/AuthContext";
import { PageHero } from "../shared/PageHero";

export function AdminShell({ children }: { children: ReactNode }) {
  const { player, loading } = useAuth();

  if (loading) {
    return (
      <>
        <PageHero eyebrow="Admin" title="Management" subtitle="球队内容管理后台" />
        <section className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-10 py-12 text-black/60">
          加载中...
        </section>
      </>
    );
  }

  if (!player) {
    return (
      <>
        <PageHero eyebrow="Admin" title="Management" subtitle="球队内容管理后台" />
        <section className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-2">需要登录</h2>
            <p className="text-black/60">请先使用球员账号登录，再进入管理后台。</p>
            <Link
              to="/login"
              className="inline-flex mt-6 px-5 py-3 bg-ink text-white text-sm font-semibold uppercase tracking-wider"
            >
              Login
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (player.role !== "admin") {
    return (
      <>
        <PageHero eyebrow="Admin" title="Management" subtitle="球队内容管理后台" />
        <section className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-2">无权访问</h2>
            <p className="text-black/60">当前账号没有管理后台权限。</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Admin" title="Management" subtitle="球队内容管理后台" />
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4 mb-8">
          <AdminTab to="/admin" label="Overview" end />
          <AdminTab to="/admin/news" label="News" />
          <AdminTab to="/admin/players" label="Players" />
          <AdminTab to="/admin/audit" label="Audit" />
          <span className="ml-auto text-xs text-black/50 uppercase tracking-wider">
            {player.username} · {player.role}
          </span>
        </div>
        {children}
      </section>
    </>
  );
}

function AdminTab({ to, label, end = false }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "px-4 py-2 text-sm font-semibold uppercase tracking-wider border",
          isActive
            ? "bg-ink text-white border-ink"
            : "bg-white text-ink border-black/10 hover:border-black/30",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
