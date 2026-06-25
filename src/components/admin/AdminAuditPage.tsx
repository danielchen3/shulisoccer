import { useEffect, useState } from "react";
import { fetchAuditLogs, type AuditLogEntry } from "../../api";
import { AdminShell } from "./AdminShell";

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAuditLogs();
      setLogs(result.auditLogs);
    } catch {
      setError("审计日志加载失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-bold mb-2">
              Audit
            </p>
            <h2 className="text-xl font-bold">操作日志</h2>
          </div>
          <button
            type="button"
            onClick={loadLogs}
            className="text-sm font-semibold uppercase tracking-wider text-black/60 hover:text-black"
          >
            Refresh
          </button>
        </div>

        {loading && <div className="p-5 text-black/60">加载中...</div>}
        {error && (
          <div className="m-5 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {!loading && logs.length === 0 && (
          <div className="p-5 text-black/60">暂无日志</div>
        )}

        <div className="divide-y divide-black/10">
          {logs.map((log) => (
            <article key={log.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-ink text-white text-[10px] font-bold uppercase tracking-wider">
                  {log.action}
                </span>
                <span className="text-sm font-semibold">{log.actorName ?? "system"}</span>
                <span className="text-xs text-black/40">
                  {log.actorRole ?? "unknown"}
                </span>
                <span className="text-xs text-black/40 ml-auto">
                  {new Date(log.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
              <div className="mt-2 text-sm text-black/60">
                {log.resourceType}
                {log.resourceId ? ` #${log.resourceId}` : ""}
              </div>
              {log.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs uppercase tracking-wider text-black/50">
                    Details
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto bg-paper-2 p-3 text-xs whitespace-pre-wrap">
                    {formatDetails(log.details)}
                  </pre>
                </details>
              )}
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

function formatDetails(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
