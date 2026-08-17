import "./LoadingScreen.css";

export function LoadingScreen({ label = "Loading…" }) {
  return (
    <div className="loading-screen">
      <div className="loading-screen__spinner" />
      <div className="loading-screen__label">{label}</div>
    </div>
  );
}
