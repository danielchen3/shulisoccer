import { Link } from "react-router-dom";
import { AdminShell } from "./AdminShell";

export function AdminHome() {
  return (
    <AdminShell>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/news"
          className="border border-black/10 bg-white p-6 hover:border-black/30 transition-colors"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-bold mb-3">
            Content
          </p>
          <h2 className="text-xl font-bold">News Management</h2>
          <p className="text-sm text-black/60 mt-2">
            发布、编辑和删除球队新闻与公告。
          </p>
        </Link>
        <Link
          to="/admin/players"
          className="border border-black/10 bg-white p-6 hover:border-black/30 transition-colors"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-bold mb-3">
            Roster
          </p>
          <h2 className="text-xl font-bold">Player Management</h2>
          <p className="text-sm text-black/60 mt-2">
            维护球员资料、数据统计和登录权限。
          </p>
        </Link>
        <Link
          to="/admin/audit"
          className="border border-black/10 bg-white p-6 hover:border-black/30 transition-colors"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-bold mb-3">
            Security
          </p>
          <h2 className="text-xl font-bold">Audit Logs</h2>
          <p className="text-sm text-black/60 mt-2">
            查看后台修改、讨论操作和审核行为。
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
