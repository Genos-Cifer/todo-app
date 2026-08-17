import { useState } from "react";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { createProfile } from "./services/profileService";
import { ConfigError } from "./components/common/ConfigError";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { LoginPage } from "./pages/LoginPage";
import { UsernameSetupPage } from "./pages/UsernameSetupPage";
import { TodoApp } from "./pages/TodoApp";

export default function App() {
  const { user, isLoading: isAuthLoading, signInWithGoogle, signOut } = useAuth();
  const { profile, setProfile, isLoading: isProfileLoading } = useProfile(user?.id);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  if (!isSupabaseConfigured) return <ConfigError />;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    const { error } = await signInWithGoogle();
    // On success the browser navigates away to Google, so there's nothing more to do here.
    if (error) {
      setAuthError(error.message);
      setIsSigningIn(false);
    }
  };

  const handleUsernameSubmit = async username => {
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
      const created = await createProfile({ id: user.id, username, avatarUrl });
      setProfile(created);
    } catch {
      setProfileError("Couldn't save your profile — please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isAuthLoading) return <LoadingScreen label="Checking your session…" />;
  if (!user) return <LoginPage onSignIn={handleSignIn} isSigningIn={isSigningIn} error={authError} />;
  if (isProfileLoading) return <LoadingScreen label="Loading your profile…" />;
  if (!profile) {
    const suggestedName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    return <UsernameSetupPage suggestedName={suggestedName} onSubmit={handleUsernameSubmit} isSaving={isSavingProfile} error={profileError} />;
  }

  return <TodoApp user={user} profile={profile} onSignOut={signOut} />;
}
