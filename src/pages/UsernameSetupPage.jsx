import { useState } from "react";
import "../styles/shared.css";
import "./UsernameSetupPage.css";

// Shown once, right after a user's very first Google sign-in (no profile row
// yet). Login itself already happened via Google — this only sets the
// display name shown around the app.
export function UsernameSetupPage({ suggestedName, onSubmit, isSaving, error }) {
  const [username, setUsername] = useState(suggestedName || "");

  const handleSubmit = e => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit(username.trim());
  };

  return (
    <div className="username-setup">
      <form className="username-setup__card" onSubmit={handleSubmit}>
        <div className="username-setup__icon">👋</div>
        <h1 className="username-setup__title">Welcome to TaskFlow</h1>
        <p className="username-setup__subtitle">
          You're signed in with Google. Pick a display name — it's just shown around the app, your login always stays
          tied to your Google account.
        </p>
        <div className="field" style={{ textAlign: "left" }}>
          <label className="field-label">Display name</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="What should we call you?"
            autoFocus
            maxLength={40}
          />
        </div>
        {error && <div className="username-setup__error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={!username.trim() || isSaving} style={{ width: "100%" }}>
          {isSaving ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
