import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getSession, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp, type MobileUser } from "./auth";

type AuthContextValue = {
  user: MobileUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<MobileUser>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ user: MobileUser | null; needsVerification: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const session = await getSession();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await apiSignIn(email, password);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const result = await apiSignUp(input);
      if (result.user) setUser(result.user);
      return result;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, signIn, signUp, signOut }),
    [user, loading, refresh, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
