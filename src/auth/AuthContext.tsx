import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCurrentPlayer,
  loginPlayer,
  logoutPlayer,
  type AuthPlayer,
} from "../api";

interface AuthContextValue {
  player: AuthPlayer | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<AuthPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await fetchCurrentPlayer();
    setPlayer(result.player);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentPlayer()
      .then((result) => {
        if (!cancelled) setPlayer(result.player);
      })
      .catch(() => {
        if (!cancelled) setPlayer(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginPlayer(username, password);
    setPlayer(result.player);
  }, []);

  const logout = useCallback(async () => {
    await logoutPlayer();
    setPlayer(null);
  }, []);

  const value = useMemo(
    () => ({ player, loading, login, logout, refresh }),
    [player, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
