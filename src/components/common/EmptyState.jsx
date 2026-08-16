import "./EmptyState.css";

export function EmptyState({ icon, title, subtitle, ctaLabel, onCta }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__title">{title}</div>
      <div className="empty-state__subtitle">{subtitle}</div>
      {ctaLabel && onCta && (
        <button className="empty-state__cta" onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  );
}
