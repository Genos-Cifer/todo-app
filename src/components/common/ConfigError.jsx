import "./ConfigError.css";

// Shown instead of crashing when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// haven't been set up yet — see SUPABASE_SETUP.md.
export function ConfigError() {
  return (
    <div className="config-error">
      <div className="config-error__card">
        <div className="config-error__icon">⚙️</div>
        <h1 className="config-error__title">Supabase isn't configured yet</h1>
        <p className="config-error__text">
          This app needs a Supabase project to handle login and store your tasks. Copy <code>.env.example</code> to{" "}
          <code>.env</code>, fill in your project's URL and anon key, then restart the dev server.
        </p>
        <p className="config-error__text">See <code>SUPABASE_SETUP.md</code> in the project root for the full step-by-step setup.</p>
      </div>
    </div>
  );
}
