import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createAdminNews,
  deleteAdminNews,
  fetchAdminNews,
  updateAdminNews,
  type NewsInput,
  type NewsItem,
} from "../../api";
import { AdminShell } from "./AdminShell";

const EMPTY_FORM: NewsInput = {
  date: "",
  content: "",
  image: "",
  body: "",
};

export function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingItem = useMemo(
    () => news.find((item) => item.id === editingId) ?? null,
    [news, editingId]
  );

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminNews();
      setNews(result.news);
    } catch {
      setError("新闻列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: NewsItem) {
    setEditingId(item.id);
    setForm({
      date: item.date,
      content: item.content,
      image: item.image ?? "",
      body: item.body ?? "",
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateAdminNews(editingId, form);
      } else {
        await createAdminNews(form);
      }
      resetForm();
      await loadNews();
    } catch {
      setError("保存失败，请检查输入后重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: NewsItem) {
    if (!window.confirm(`删除新闻：${item.content}`)) return;

    setError(null);
    try {
      await deleteAdminNews(item.id);
      if (editingId === item.id) resetForm();
      await loadNews();
    } catch {
      setError("删除失败");
    }
  }

  return (
    <AdminShell>
      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-bold mb-2">
              {editingItem ? "Edit News" : "New News"}
            </p>
            <h2 className="text-xl font-bold">
              {editingItem ? editingItem.content : "发布新闻"}
            </h2>
          </div>

          <Field label="Date">
            <input
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              placeholder="2026-05-28"
              className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
            />
          </Field>

          <Field label="Title">
            <textarea
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              rows={3}
              className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
            />
          </Field>

          <Field label="Images">
            <input
              value={form.image ?? ""}
              onChange={(event) => setForm({ ...form, image: event.target.value })}
              placeholder="assets/news/example.jpg"
              className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
            />
          </Field>

          <Field label="Body">
            <textarea
              value={form.body ?? ""}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              rows={8}
              className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
            />
          </Field>

          {error && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !form.date.trim() || !form.content.trim()}
              className="px-5 py-3 bg-ink text-white text-sm font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 border border-black/20 text-sm font-semibold uppercase tracking-wider"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white border border-black/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
            <h2 className="text-xl font-bold">新闻列表</h2>
            <button
              type="button"
              onClick={loadNews}
              className="text-sm font-semibold uppercase tracking-wider text-black/60 hover:text-black"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-5 text-black/60">加载中...</div>
          ) : (
            <div className="divide-y divide-black/10">
              {news.map((item) => (
                <article key={item.id} className="p-5 flex flex-col gap-3 xl:flex-row xl:items-start">
                  <div className="flex-1 min-w-0">
                    <time className="text-xs font-mono text-black/50">{item.date}</time>
                    <h3 className="font-semibold mt-1">{item.content}</h3>
                    {item.image && (
                      <p className="text-xs text-black/50 mt-2 break-all">{item.image}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="px-3 py-2 border border-black/20 text-xs font-semibold uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="px-3 py-2 border border-red-200 text-xs font-semibold uppercase tracking-wider text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">{label}</span>
      {children}
    </label>
  );
}
