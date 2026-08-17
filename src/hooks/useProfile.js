import { useEffect, useState } from "react";
import { fetchProfile } from "../services/profileService";

// Loads the signed-in user's profile row. `profile` stays `null` for a
// first-time login (no row yet) — the caller shows the username setup step.
//
// Loading/profile are derived from comparing the last-*loaded* user id against
// the current one, rather than tracked as separately-set state, so the fetch
// effect never needs to call setState synchronously (only from its .then()).
export function useProfile(userId) {
  const [result, setResult] = useState({ userId: null, profile: null });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchProfile(userId).then(data => {
      if (!cancelled) setResult({ userId, profile: data });
    });
    return () => { cancelled = true; };
  }, [userId]);

  const isLoading = Boolean(userId) && result.userId !== userId;
  const profile = result.userId === userId ? result.profile : null;
  const setProfile = profile => setResult({ userId, profile });

  return { profile, setProfile, isLoading };
}
