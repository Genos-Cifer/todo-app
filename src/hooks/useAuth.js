import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Tracks the Supabase auth session. `session` is `undefined` while the very
// first check is in flight, `null` when signed out, or the session object.
export function useAuth() {
  const [session, setSession] = useState(() => (supabase ? undefined : null));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(() => {
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return {
    session,
    user: session?.user ?? null,
    isLoading: session === undefined,
    signInWithGoogle,
    signOut,
  };
}
