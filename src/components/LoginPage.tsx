import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api";
import { useAuth } from "../auth/AuthContext";
import { PageHero } from "./shared/PageHero";

export function LoginPage() {
  const navigate = useNavigate();
  const { player, login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status >= 500) {
        setError("Login server error. Check production D1 binding and remote migrations.");
      } else {
        setError("Username or password is incorrect.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && player) {
    return (
      <>
        <PageHero eyebrow="Account" title="Player Login" subtitle="Team member access" />
        <section className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div className="border border-black/10 bg-white p-6 sm:p-8">
            <p className="text-sm text-black/60 mb-2">Signed in as</p>
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <p className="text-sm text-black/60 mt-1">
              {player.username} / {player.role}
            </p>
            <Link
              to="/"
              className="inline-flex mt-6 px-5 py-3 bg-ink text-white text-sm font-semibold uppercase tracking-wider"
            >
              Back Home
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Account" title="Player Login" subtitle="Team member access" />
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <form
          onSubmit={handleSubmit}
          className="border border-black/10 bg-white p-6 sm:p-8 space-y-5"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-semibold mb-2">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="w-full border border-black/20 px-4 py-3 outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full border border-black/20 px-4 py-3 outline-none focus:border-brand-600"
            />
          </div>

          {error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !username.trim() || !password}
            className="w-full px-5 py-3 bg-ink text-white text-sm font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </>
  );
}
