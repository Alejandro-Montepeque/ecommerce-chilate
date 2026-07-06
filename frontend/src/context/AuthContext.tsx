import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { tokenStore } from "@/lib/api";
import { authApi } from "@/features/auth/auth.api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    const res = await authApi.login(email, password);
    tokenStore.set(res.accessToken);
    setUser(res.user);
  }

  async function signUp(email: string, password: string, fullName?: string) {
    const res = await authApi.register(email, password, fullName);
    tokenStore.set(res.accessToken);
    setUser(res.user);
  }

  function signOut() {
    tokenStore.clear();
    setUser(null);
  }

  const isStaff = user?.role === "MAINTENANCE" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, loading, isStaff, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
