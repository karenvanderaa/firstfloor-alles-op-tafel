import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AdminStatus = "idle" | "checking" | "admin" | "not-admin" | "error";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  adminStatus: AdminStatus;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>("idle");
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string): Promise<AdminStatus> => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return "error";
    return data ? "admin" : "not-admin";
  };

  useEffect(() => {
    let mounted = true;
    let checkVersion = 0;

    const handleSession = (newSession: Session | null) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      const uid = newSession?.user?.id ?? null;
      const currentCheck = ++checkVersion;

      if (!uid) {
        setIsAdmin(false);
        setAdminStatus("idle");
        setLoading(false);
        return;
      }

      setIsAdmin(false);
      setAdminStatus("checking");

      setTimeout(async () => {
        const result = await checkAdmin(uid);
        if (!mounted || currentCheck !== checkVersion) return;

        setAdminStatus(result);
        setIsAdmin(result === "admin");
        setLoading(false);
      }, 0);
    };

    // Listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handleSession(newSession);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      handleSession(existing);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, adminStatus, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
