"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Role, User } from "./types";

type SessionCtx = {
  user: User | null;
  loading: boolean;
  login: (role: Role, tenantId?: string) => Promise<void>;
  loginWithUser: (user: User) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<SessionCtx>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithUser: async () => {},
  logout: () => {},
});

const KEY = "sisakti.session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (role: Role, tenantId?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role, tenantId }),
    });
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem(KEY, JSON.stringify(data.user));
  }, []);

  const loginWithUser = useCallback(async (u: User) => {
    setUser(u);
    localStorage.setItem(KEY, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(KEY);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, loginWithUser, logout }}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}
