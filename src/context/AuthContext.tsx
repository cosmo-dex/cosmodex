"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id?: string;
  userId?: string;
  username: string;
  email: string;
  avatarId?: string | null;
  xpTotal?: number;
  level?: number;
  role?: string;
  experienceLevel?: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkSession: (force?: boolean) => Promise<UserSession | null>;
  refreshSession: () => Promise<UserSession | null>;
  logout: (redirectPath?: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserSession | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "cosmodex_auth_user";
const AUTH_EVENT_KEY = "cosmodex_auth_sync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingSessionCheckRef = useRef<Promise<UserSession | null> | null>(null);


  const setUser = useCallback(
    (action: React.SetStateAction<UserSession | null>) => {
      setUserState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          try {
            if (next) {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
            } else {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          } catch {
            // Ignore storage access errors
          }
        }
        return next;
      });
    },
    []
  );

  const checkSession = useCallback(
    async (force = false): Promise<UserSession | null> => {
      if (pendingSessionCheckRef.current && !force) {
        return pendingSessionCheckRef.current;
      }

      const fetchPromise = (async () => {
        try {
          const response = await fetch("/api/auth/session", {
            credentials: "include",
            cache: "no-store",
          });

          if (!response.ok) {
            setUser(null);
            return null;
          }

          const data = await response.json();
          const sessionUser: UserSession | null = data?.user ?? null;

          setUser(sessionUser);
          return sessionUser;
        } catch (error) {
          console.error("Session check failed:", error);
          return null;
        } finally {
          setIsLoading(false);
          pendingSessionCheckRef.current = null;
        }
      })();

      pendingSessionCheckRef.current = fetchPromise;
      return fetchPromise;
    },
    [setUser]
  );

  const refreshSession = useCallback(async () => {
    return checkSession(true);
  }, [checkSession]);

  const logout = useCallback(
    async (redirectPath = "/") => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setUser(null);
        if (typeof window !== "undefined") {
          try {
            window.dispatchEvent(
              new CustomEvent(AUTH_EVENT_KEY, { detail: { action: "logout" } })
            );
          } catch {
            // Ignore dispatch errors
          }
        }
        router.push(redirectPath);
        router.refresh();
      }
    },
    [setUser, router]
  );

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const cached = localStorage.getItem(AUTH_STORAGE_KEY);
        if (cached && active) {
          setUserState(JSON.parse(cached));
        }
      } catch {
        // Ignore parse errors
      }
      await checkSession();
    };
    init();
    return () => {
      active = false;
    };
  }, [checkSession]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) {
        try {
          const updatedUser = event.newValue ? JSON.parse(event.newValue) : null;
          setUserState(updatedUser);
        } catch {
          setUserState(null);
        }
      }
    };

    const handleCustomSync = (event: Event) => {
      const customEvt = event as CustomEvent;
      if (customEvt.detail?.action === "logout") {
        setUserState(null);
      } else if (customEvt.detail?.action === "login") {
        checkSession(true);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_EVENT_KEY, handleCustomSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_EVENT_KEY, handleCustomSync);
    };
  }, [checkSession]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    checkSession,
    refreshSession,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
