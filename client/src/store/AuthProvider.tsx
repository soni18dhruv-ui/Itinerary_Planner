import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@shared/types";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { fetchProfile } from "../services/profile";
import { tripsAPI } from "../services/tripsAPI";

type AuthUser = User | { id: string; email?: string; full_name?: string };

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: AuthUser | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<string | null>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
};

const DEFAULT_GUEST_PROFILE: Profile = {
  id: "guest-traveler",
  full_name: "Alex Vance",
  home_city: "San Francisco",
  travel_style: "culture",
  budget_level: "moderate",
  interests: ["history", "photography", "markets", "coffee"],
  dietary_notes: "Vegetarian",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const SESSION_STORAGE_KEY = "daytrail_auth_session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    // Check saved local session
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user) return parsed.user;
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile) return parsed.profile;
      } catch {
        // ignore
      }
    }
    return null;
  });

  async function loadProfile(userId: string) {
    try {
      const next = await fetchProfile(userId);
      setProfile(next);
      // update stored profile
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.profile = next;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    } catch {
      setProfile(DEFAULT_GUEST_PROFILE);
    }
  }

  useEffect(() => {
    // 1. If we already restored a session from localStorage, verify profile
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user?.id) {
          void loadProfile(parsed.user.id);
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    // 2. If Supabase is configured, check for supabase session
    if (supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        setSession(data.session);
        if (data.session?.user.id) {
          setAuthUser(data.session.user);
          try {
            await loadProfile(data.session.user.id);
          } catch {
            setProfile(DEFAULT_GUEST_PROFILE);
          }
        }
        setLoading(false);
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user.id) {
          setAuthUser(nextSession.user);
          void loadProfile(nextSession.user.id).catch(() => setProfile(DEFAULT_GUEST_PROFILE));
        }
      });

      return () => listener.subscription.unsubscribe();
    }

    // 3. Neither Supabase nor saved session
    setLoading(false);
  }, []);

  const continueAsGuest = () => {
    const guestUser = { id: "guest-traveler", email: "guest@daytrail.app", full_name: "Alex Vance" };
    setAuthUser(guestUser);
    setProfile(DEFAULT_GUEST_PROFILE);
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ user: guestUser, profile: DEFAULT_GUEST_PROFILE, token: "guest" }),
    );
  };

  const signIn = async (email: string, password: string) => {
    // 1. Try FastAPI backend first
    try {
      const res = await tripsAPI.login({ email, password });
      setAuthUser(res.user);
      setProfile(res.profile);
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ user: res.user, profile: res.profile, token: res.token }),
      );
      return;
    } catch (err) {
      // If backend error and supabase configured, try supabase
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return;
      }
      throw err;
    }
  };

  const signUp = async (fullName: string, email: string, password: string): Promise<string | null> => {
    // 1. Try FastAPI backend first
    try {
      const res = await tripsAPI.signup({ full_name: fullName, email, password });
      setAuthUser(res.user);
      setProfile(res.profile);
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ user: res.user, profile: res.profile, token: res.token }),
      );
      return null;
    } catch (err) {
      // If backend error and supabase configured, try supabase
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (!data.session) {
          return "Check your email to confirm the account, then sign in.";
        }
        return null;
      }
      throw err;
    }
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setSession(null);
    setAuthUser(null);
    setProfile(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: true, // Backend auth is always configured and active!
      loading,
      session,
      user: session?.user ?? authUser,
      profile,
      refreshProfile: async () => {
        const id = session?.user.id || authUser?.id;
        if (id) await loadProfile(id);
      },
      signIn,
      signUp,
      continueAsGuest,
      signOut,
    }),
    [loading, session, authUser, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
