import { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Tables } from "../types/supabase";
import { toast } from "../hooks/use-toast";
import { sendWelcomeEmail, sendAccountUpdateNotification } from "../utils/emailHelpers";

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
  const welcomeEmailSentRef = useRef<Set<string>>(new Set()); // Track which users have received welcome email

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
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let subscription: any;
    
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          
          // Check if welcome email should be sent for initial session
          const userId = session.user.id;
          const emailConfirmed = session.user.email_confirmed_at;
          const email = session.user.email;
          
          // Only send if email is confirmed and hasn't been sent before
          if (
            emailConfirmed && 
            email && 
            !welcomeEmailSentRef.current.has(userId)
          ) {
            try {
              // Fire and forget - don't block on email
              sendWelcomeEmail(email, {
                userName: userProfile?.name || email.split('@')[0],
                loginUrl: 'https://theenclosure.co.uk/login',
                dashboardUrl: 'https://theenclosure.co.uk/dashboard',
              }).then((result) => {
                if (result.success) {
                  welcomeEmailSentRef.current.add(userId);
                }
              }).catch((error) => {
                console.error('Failed to send welcome email:', error);
              });
            } catch (error) {
              console.error('Error triggering welcome email:', error);
            }
          }
        }
        
        setLoading(false);
        
        // Listen for auth changes
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id);
            
            // Send welcome email after email verification
            if (
              event === 'SIGNED_IN' || 
              event === 'USER_UPDATED' || 
              event === 'TOKEN_REFRESHED'
            ) {
              const userId = session.user.id;
              const emailConfirmed = session.user.email_confirmed_at;
              const email = session.user.email;
              
              // Only send if email is confirmed and hasn't been sent before
              if (
                emailConfirmed && 
                email && 
                !welcomeEmailSentRef.current.has(userId)
              ) {
                try {
                  // Fire and forget - don't block on email
                  sendWelcomeEmail(email, {
                    userName: userProfile?.name || email.split('@')[0],
                    loginUrl: 'https://theenclosure.co.uk/login',
                    dashboardUrl: 'https://theenclosure.co.uk/dashboard',
                  }).then((result) => {
                    if (result.success) {
                      welcomeEmailSentRef.current.add(userId);
                    }
                  }).catch((error) => {
                    console.error('Failed to send welcome email:', error);
                    // Don't show error to user - email failure shouldn't block their experience
                  });
                } catch (error) {
                  console.error('Error triggering welcome email:', error);
                }
              }
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

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      
      // The Supabase client sometimes hangs - use a race with timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Wait max 3 seconds for the promise
      const timeoutPromise = new Promise<any>((resolve) => {
        setTimeout(async () => {
          // If it times out, check the session directly
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            // Return the same structure as signInWithPassword
            resolve({ 
              data: { 
                user: sessionData.session.user, 
                session: sessionData.session 
              }, 
              error: null 
            });
          } else {
            resolve({ data: { user: null, session: null }, error: new Error("Authentication timed out") });
          }
        }, 3000);
      });
      
      const result = await Promise.race([authPromise, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) {
        return { 
          error: error, 
          requiresPasswordChange: false 
        };
      }

      if (data.user) {
        const userProfile = await fetchProfile(data.user.id);
        
        // Update last_login
        try {
          await supabase
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", data.user.id);
        } catch (updateError) {
          console.error("Error updating last_login:", updateError);
        }

        // Check if user needs to change password
        const requiresPasswordChange = userProfile?.requires_password_change ?? false;

        // Handle "remember me" functionality
        if (!rememberMe) {
          try {
            // Add timeout since this can also hang
            const sessionPromise = supabase.auth.updateUser({
              data: { session_lifetime: "transient" },
            });
            const sessionTimeout = new Promise((resolve) => setTimeout(() => {
              resolve({ data: null, error: null });
            }, 1000));
            
            await Promise.race([sessionPromise, sessionTimeout]);
          } catch (sessionError) {
            console.error("Error updating session:", sessionError);
          }
        }

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
      // Track which fields were updated
      const updatedFields: string[] = [];
      const oldProfile = profile;
      
      if (updates.name !== undefined && updates.name !== oldProfile?.name) {
        updatedFields.push('name');
      }
      if (updates.email !== undefined && updates.email !== oldProfile?.email) {
        updatedFields.push('email');
      }
      if (updates.phone !== undefined && updates.phone !== oldProfile?.phone) {
        updatedFields.push('phone');
      }
      if (updates.address !== undefined && updates.address !== oldProfile?.address) {
        updatedFields.push('address');
      }
      if (updates.city !== undefined && updates.city !== oldProfile?.city) {
        updatedFields.push('city');
      }
      if (updates.postcode !== undefined && updates.postcode !== oldProfile?.postcode) {
        updatedFields.push('postcode');
      }
      if (updates.country !== undefined && updates.country !== oldProfile?.country) {
        updatedFields.push('country');
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

      // Send account update notification if fields were changed (fire and forget)
      if (updatedFields.length > 0 && user.email) {
        try {
          sendAccountUpdateNotification(user.email, updatedFields, {
            userName: updates.name || profile?.name || user.email.split('@')[0],
            accountSettingsUrl: 'https://theenclosure.co.uk/settings',
          }).catch((error) => {
            console.error('Failed to send account update notification:', error);
            // Don't show error to user
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

      // Clear the requires_password_change and must_change_password flags, set password_changed_at
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

