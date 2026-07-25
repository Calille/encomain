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
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null; requiresPasswordChange: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch user profile from the users table
  const fetchProfile = async (userId: string) => {
    try {
      console.log('[AUTH] Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[AUTH] Error fetching profile:", error);
        throw error;
      }
      
      console.log('[AUTH] Profile fetched successfully:', data?.email);
      setProfile(data);
      return data;
    } catch (error) {
      console.error("[AUTH] Failed to fetch profile:", error);
      setProfile(null);
      return null;
    }
  };

  // Initialise auth state (welcome emails are NOT triggered here; see admin-create-user flow)
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;
    
    const initAuth = async () => {
      try {
        console.log('[AUTH] Initializing authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH] Error getting session:", error);
          throw error;
        }
        
        console.log('[AUTH] Session retrieved:', session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('[AUTH] User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('[AUTH] No user session found');
        }
        
        console.log('[AUTH] Setting loading to false');
        setLoading(false);
        
        console.log('[AUTH] Setting up onAuthStateChange listener');
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log(`[AUTH] Auth state change: ${_event}`, session?.user?.email || 'no user');
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              console.log('[AUTH] Fetching profile for auth state change...');
              const userProfile = await fetchProfile(session.user.id);
              
              if (!userProfile) {
                console.error('[AUTH] Failed to fetch profile during auth state change');
              }
            } catch (error) {
              console.error('[AUTH] Error fetching profile during auth state change:', error);
            }
          } else {
            setProfile(null);
          }
        });
        
        subscription = sub;
      } catch (error) {
        console.error("AuthProvider initialization failed:", error);
        setInitError(error instanceof Error ? error : new Error("Unknown error"));
        setLoading(false);
      }
    };
    
    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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
          requiresPasswordChange: false 
        };
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        
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
      return { 
        error: error instanceof Error ? error : new Error("Sign in failed"), 
        requiresPasswordChange: false 
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
        updatedFields.push('full_name');
      }
      if (updates.email !== undefined && updates.email !== oldProfile?.email) {
        updatedFields.push('email');
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
            userName: updates.full_name || profile?.full_name || user.email.split('@')[0],
            accountSettingsUrl: 'https://theenclosure.co.uk/settings',
          }).catch((error) => {
            console.error('Failed to send account update notification:', error);
          });
        } catch (error) {
          console.error('Error triggering account update notification:', error);
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
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
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
