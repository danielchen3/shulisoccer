import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  createAdminPlayer,
  deleteAdminPlayer,
  fetchAdminPlayers,
  updateAdminPlayer,
  type AdminPlayer,
  type PlayerInput,
  type PlayerRole,
} from "../../api";
import { AdminShell } from "./AdminShell";

type PositionGroup = PlayerInput["positionGroup"];

const POSITION_GROUPS: { value: PositionGroup; label: string }[] = [
  { value: "goalkeeper", label: "Goalkeeper" },
  { value: "defender", label: "Defender" },
  { value: "midfield", label: "Midfield" },
  { value: "forward", label: "Forward" },
];

const ROLES: PlayerRole[] = ["player", "captain", "admin"];

const EMPTY_PLAYER: PlayerInput = {
  positionGroup: "midfield",
  position: "",
  number: 0,
  filename: "",
  name: "",
  enName: "",
  club: "",
  nationality: "",
  nationalityFlag: "",
  province: "",
  age: 0,
  birthday: "",
  height: 0,
  weight: 0,
  foot: "",
  starts: 0,
  subs: 0,
  goals: 0,
  role: "player",
  loginEnabled: 1,
  resetPassword: false,
};

export function AdminPlayersPage() {
  const { player: currentPlayer } = useAuth();
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [form, setForm] = useState<PlayerInput>(EMPTY_PLAYER);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingPlayer = useMemo(
    () => players.find((item) => item.id === editingId) ?? null,
    [players, editingId]
  );

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminPlayers();
      setPlayers(result.players);
    } catch {
      setError("球员列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item: AdminPlayer) {
    setEditingId(item.id);
    setForm({
      positionGroup: item.positionGroup,
      position: item.position,
      number: item.number ?? 0,
      filename: item.filename,
      name: item.name,
      enName: item.enName ?? "",
      club: item.club ?? "",
      nationality: item.nationality ?? "",
      nationalityFlag: item.nationalityFlag ?? "",
      province: item.province ?? "",
      age: item.age ?? 0,
      birthday: item.birthday ?? "",
      height: item.height ?? 0,
      weight: item.weight ?? 0,
      foot: item.foot ?? "",
      starts: item.starts ?? 0,
      subs: item.subs ?? 0,
      goals: item.goals ?? 0,
      role: item.role,
      loginEnabled: item.loginEnabled,
      resetPassword: false,
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_PLAYER);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await updateAdminPlayer(editingId, form);
      } else {
        await createAdminPlayer(form);
      }
      resetForm();
      await loadPlayers();
    } catch {
      setError("保存失败，请检查 filename 是否重复、必填字段是否完整");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: AdminPlayer) {
    if (currentPlayer?.id === item.id) {
      setError("不能删除当前登录账号");
      return;
    }
    if (!window.confirm(`删除球员：${item.name}`)) return;

    setError(null);
    try {
      await deleteAdminPlayer(item.id);
      if (editingId === item.id) resetForm();
      await loadPlayers();
    } catch {
      setError("删除失败");
    }
  }

  return (
    <AdminShell>
      <div className="grid gap-8 xl:grid-cols-[460px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-5 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700 font-bold mb-2">
              {editingPlayer ? "Edit Player" : "New Player"}
            </p>
            <h2 className="text-xl font-bold">
              {editingPlayer ? editingPlayer.name : "新增球员"}
            </h2>
            {!editingPlayer && (
              <p className="text-xs text-black/50 mt-2">
                新球员账号会自动使用 filename 作为用户名，初始密码为 filename_123。
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <TextInput value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            </Field>
            <Field label="Filename">
              <TextInput
                value={form.filename}
                onChange={(value) => setForm({ ...form, filename: value })}
                placeholder="ccx"
              />
            </Field>
            <Field label="Position Group">
              <select
                value={form.positionGroup}
                onChange={(event) =>
                  setForm({ ...form, positionGroup: event.target.value as PositionGroup })
                }
                className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
              >
                {POSITION_GROUPS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Position">
              <TextInput
                value={form.position}
                onChange={(value) => setForm({ ...form, position: value })}
                placeholder="中场"
              />
            </Field>
            <Field label="Number">
              <NumberInput value={form.number} onChange={(value) => setForm({ ...form, number: value })} />
            </Field>
            <Field label="Role">
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as PlayerRole })}
                className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="English Name">
              <TextInput value={form.enName ?? ""} onChange={(value) => setForm({ ...form, enName: value })} />
            </Field>
            <Field label="Club">
              <TextInput value={form.club ?? ""} onChange={(value) => setForm({ ...form, club: value })} />
            </Field>
            <Field label="Province">
              <TextInput value={form.province ?? ""} onChange={(value) => setForm({ ...form, province: value })} />
            </Field>
            <Field label="Birthday">
              <TextInput
                value={form.birthday ?? ""}
                onChange={(value) => setForm({ ...form, birthday: value })}
                placeholder="2004-06-01"
              />
            </Field>
            <Field label="Foot">
              <TextInput value={form.foot ?? ""} onChange={(value) => setForm({ ...form, foot: value })} />
            </Field>
            <Field label="Nationality">
              <TextInput
                value={form.nationality ?? ""}
                onChange={(value) => setForm({ ...form, nationality: value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Age">
              <NumberInput value={form.age ?? 0} onChange={(value) => setForm({ ...form, age: value })} />
            </Field>
            <Field label="Height">
              <NumberInput value={form.height ?? 0} onChange={(value) => setForm({ ...form, height: value })} />
            </Field>
            <Field label="Weight">
              <NumberInput value={form.weight ?? 0} onChange={(value) => setForm({ ...form, weight: value })} />
            </Field>
            <Field label="Starts">
              <NumberInput value={form.starts ?? 0} onChange={(value) => setForm({ ...form, starts: value })} />
            </Field>
            <Field label="Subs">
              <NumberInput value={form.subs ?? 0} onChange={(value) => setForm({ ...form, subs: value })} />
            </Field>
            <Field label="Goals">
              <NumberInput value={form.goals ?? 0} onChange={(value) => setForm({ ...form, goals: value })} />
            </Field>
          </div>

          <div className="space-y-3 border-t border-black/10 pt-4">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.loginEnabled === 1}
                onChange={(event) =>
                  setForm({ ...form, loginEnabled: event.target.checked ? 1 : 0 })
                }
              />
              允许该球员登录
            </label>
            {editingId && (
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.resetPassword === true}
                  onChange={(event) =>
                    setForm({ ...form, resetPassword: event.target.checked })
                  }
                />
                保存时将密码重置为 {form.filename || "filename"}_123
              </label>
            )}
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.filename.trim() || !form.position.trim()}
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
            <h2 className="text-xl font-bold">球员列表</h2>
            <button
              type="button"
              onClick={loadPlayers}
              className="text-sm font-semibold uppercase tracking-wider text-black/60 hover:text-black"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-5 text-black/60">加载中...</div>
          ) : (
            <div className="divide-y divide-black/10">
              {players.map((item) => (
                <article key={item.id} className="p-5 flex flex-col gap-3 2xl:flex-row 2xl:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-2xl text-brand-700">#{item.number}</span>
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="text-xs uppercase tracking-wider text-black/40">
                        {item.filename}
                      </span>
                    </div>
                    <p className="text-sm text-black/60 mt-1">
                      {item.positionGroup} · {item.position} · {item.role}
                      {item.loginEnabled ? " · login enabled" : " · login disabled"}
                    </p>
                    <p className="text-xs text-black/40 mt-1">
                      Apps {(item.starts ?? 0) + (item.subs ?? 0)} · Goals {item.goals ?? 0}
                    </p>
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
                      disabled={currentPlayer?.id === item.id}
                      className="px-3 py-2 border border-red-200 text-xs font-semibold uppercase tracking-wider text-red-700 disabled:opacity-40"
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-2">{label}</span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
    />
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full border border-black/20 px-3 py-2 outline-none focus:border-brand-600"
    />
  );
}
