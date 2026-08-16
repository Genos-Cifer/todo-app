import { THEMES } from "../../constants/themes";
import "./ThemeSwitcher.css";

export function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="theme-switcher">
      <select className="theme-switcher__select" value={theme} onChange={e => onChange(e.target.value)} aria-label="Theme">
        {THEMES.map(t => (
          <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
        ))}
      </select>
    </div>
  );
}
