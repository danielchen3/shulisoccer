import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { PageHero } from "../shared/PageHero";

export const DISCUSSION_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "training", label: "Training" },
  { value: "match", label: "Match" },
  { value: "tactics", label: "Tactics" },
  { value: "announcement", label: "Announcement" },
] as const;

export function DiscussionGate({ children }: { children: React.ReactNode }) {
  const { player, loading } = useAuth();

  if (loading) {
    return (
      <>
        <PageHero eyebrow="Team Panel" title="Discussion" subtitle="球员内部讨论区" />
        <section className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-10 py-12 text-black/60">
          加载中...
        </section>
      </>
    );
  }

  if (!player) {
    return (
      <>
        <PageHero eyebrow="Team Panel" title="Discussion" subtitle="球员内部讨论区" />
        <section className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-2">需要登录</h2>
            <p className="text-black/60">讨论区仅对球队成员开放。</p>
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

  return <>{children}</>;
}

export function RoleBadge({ role }: { role: string }) {
  if (role === "player") return null;
  return (
    <span className="inline-flex px-2 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold uppercase tracking-wider">
      {role}
    </span>
  );
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
