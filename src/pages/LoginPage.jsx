import "./LoginPage.css";

const FEATURES = [
  ["🎯", "Priorities & due dates", "Sort what matters, spot what's overdue at a glance."],
  ["✅", "Subtasks & progress", "Break work down and watch the progress bar fill in."],
  ["🏷", "Tags & backlog", "Organize by context, park what's not urgent for later."],
  ["📊", "Calendar & metrics", "See your week at a glance and track your completion rate."],
];

export function LoginPage({ onSignIn, isSigningIn, error }) {
  return (
    <div className="login-page">
      <div className="login-page__hero">
        <div className="login-page__logo">
          <div className="login-page__logo-icon">✓</div>
          <span className="login-page__logo-text">TaskFlow</span>
        </div>
        <h1 className="login-page__title">Get more done, one task at a time.</h1>
        <p className="login-page__subtitle">
          TaskFlow is a focused todo manager built for people who'd rather spend time doing the work than managing the
          list. Track priorities, due dates, and subtasks; organize with tags and a backlog; see your progress on a
          calendar and a metrics dashboard.
        </p>
        <ul className="login-page__features">
          {FEATURES.map(([icon, title, text]) => (
            <li key={title} className="login-page__feature">
              <span className="login-page__feature-icon">{icon}</span>
              <div>
                <div className="login-page__feature-title">{title}</div>
                <div className="login-page__feature-text">{text}</div>
              </div>
            </li>
          ))}
        </ul>
        <blockquote className="login-page__quote">
          <span className="login-page__quote-mark">“</span>
          What gets measured gets managed.
          <footer className="login-page__quote-author">— Peter Drucker</footer>
        </blockquote>
      </div>

      <div className="login-page__panel">
        <div className="login-page__card">
          <h2 className="login-page__card-title">Welcome back</h2>
          <p className="login-page__card-subtitle">Sign in to see your tasks, wherever you left them.</p>
          <button className="google-btn" onClick={onSignIn} disabled={isSigningIn}>
            <GoogleIcon />
            {isSigningIn ? "Redirecting…" : "Continue with Google"}
          </button>
          {error && <div className="login-page__error">{error}</div>}
          <p className="login-page__note">We only use your Google account to sign you in — nothing is posted or shared.</p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.7H.98v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.05l2.98-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.95l2.98 2.33C4.67 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}
