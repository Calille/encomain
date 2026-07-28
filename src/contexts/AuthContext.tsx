import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Tables } from "../types/supabase";
import { toast } from "../hooks/use-toast";
import { sendAccountUpdateNotification } from "../utils/emailHelpers";

type UserProfile = Tables<"users">;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  /** True while a profile fetch is in flight for the current user */
  profileLoading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null; requiresPasswordChange: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log("[AUTH] Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[AUTH] Error fetching profile:", error);
      throw error;
    }

    console.log("[AUTH] Profile fetched successfully:", data?.email);
    return data;
  } catch (error) {
    console.error("[AUTH] Failed to fetch profile:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  const isAdmin = profile?.role === "admin" && profile?.status === "active";

  // Show error if initialization fails
  if (initError) {
    console.error("AuthProvider initialization error:", initError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{initError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Initialise session + subscribe to auth changes.
  // CRITICAL: never await supabase.from() / other client APIs inside onAuthStateChange —
  // that deadlocks the auth lock and hangs every subsequent query (login + admin data).
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("[AUTH] Initializing authentication...");
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[AUTH] Error getting session:", error);
          throw error;
        }

        if (!mounted) return;

        console.log("[AUTH] Session retrieved:", initialSession?.user?.email || "no user");
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        // Profile is loaded in a separate effect keyed on user.id (outside the auth lock).

        console.log("[AUTH] Setting loading to false");
        setLoading(false);
      } catch (error) {
        console.error("AuthProvider initialization failed:", error);
        if (!mounted) return;
        setInitError(error instanceof Error ? error : new Error("Unknown error"));
        setLoading(false);
        setProfileLoading(false);
      }
    };

    initAuth();

    console.log("[AUTH] Setting up onAuthStateChange listener");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.log(`[AUTH] Auth state change: ${event}`, nextSession?.user?.email || "no user");

      // Synchronous React updates only — profile fetch happens in a separate effect.
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load profile outside the auth lock whenever the signed-in user changes.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      return;
    }

    let cancelled = false;
    setProfileLoading(true);

    (async () => {
      const userProfile = await fetchProfile(userId);
      if (cancelled) return;

      if (userProfile?.deleted_at) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error("Sign out for soft-deleted session failed:", err);
        }
        if (cancelled) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setProfileLoading(false);
        toast({
          title: "Account deactivated",
          description:
            "This account has been deactivated. If you deleted it recently, check your email for a recovery link. Otherwise, contact hello@theenclosure.co.uk.",
          variant: "destructive",
        });
        return;
      }

      setProfile(userProfile);
      setProfileLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const DEACTIVATED_MESSAGE =
    "This account has been deactivated. If you deleted it recently, check your email for a recovery link. Otherwise, contact hello@theenclosure.co.uk.";

  const signOutQuiet = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out after deactivation check failed:", err);
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setProfileLoading(false);
  };

  const isSoftDeleted = (userProfile: UserProfile | null): boolean => {
    return Boolean(userProfile && (userProfile as UserProfile & { deleted_at?: string | null }).deleted_at);
  };

  const signIn = async (email: string, password: string, _rememberMe = false) => {
    try {
      // TODO: Implement proper remember-me (e.g. shorter session via Auth settings
      // or custom refresh handling). Do not call updateUser with fake session_lifetime metadata.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          error: error,
          requiresPasswordChange: false,
        };
      }

      if (data.user) {
        // Propagate session immediately so route guards / role-landing see auth
        // without waiting on the listener (and without deadlocking it).
        setSession(data.session);
        setUser(data.user);

        setProfileLoading(true);
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        setProfileLoading(false);

        if (isSoftDeleted(userProfile)) {
          await signOutQuiet();
          return {
            error: new Error(DEACTIVATED_MESSAGE),
            requiresPasswordChange: false,
          };
        }

        try {
          await supabase
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", data.user.id);
        } catch (updateError) {
          console.error("Error updating last_login:", updateError);
        }

        const requiresPasswordChange = userProfile?.requires_password_change ?? false;

        return { error: null, requiresPasswordChange };
      }

      return { error: new Error("Sign in failed"), requiresPasswordChange: false };
    } catch (error) {
      console.error("Sign in exception:", error);
      setProfileLoading(false);
      return {
        error: error instanceof Error ? error : new Error("Sign in failed"),
        requiresPasswordChange: false,
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in");

    try {
      const updatedFields: string[] = [];
      const oldProfile = profile;

      if (updates.full_name !== undefined && updates.full_name !== oldProfile?.full_name) {
        updatedFields.push("full_name");
      }
      if (updates.email !== undefined && updates.email !== oldProfile?.email) {
        updatedFields.push("email");
      }

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      if (updatedFields.length > 0 && user.email) {
        try {
          sendAccountUpdateNotification(user.email, updatedFields, {
            userName: updates.full_name || profile?.full_name || user.email.split("@")[0],
            accountSettingsUrl: "https://theenclosure.co.uk/settings",
          }).catch((error) => {
            console.error("Failed to send account update notification:", error);
          });
        } catch (error) {
          console.error("Error triggering account update notification:", error);
        }
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      if (user) {
        await supabase
          .from("users")
          .update({
            requires_password_change: false,
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        await refreshProfile();
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    const userProfile = await fetchProfile(user.id);
    setProfile(userProfile);
    setProfileLoading(false);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    profileLoading,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    resetPassword,
    refreshProfile,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
