import { useRef, useState } from "react";
import { MODES, PALETTES } from "../../constants/themes";
import { useClickOutside } from "../../hooks/useClickOutside";
import "./ThemeSwitcher.css";

// Color and light/dark are independent choices, so the picker presents them as
// two rows rather than one flat list. Each swatch carries its own `data-theme`
// and derives its colors from styles/themes.css, so previews can never drift
// out of sync with the real palettes.
export function ThemeSwitcher({ palette, onPaletteChange, mode, onModeChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef();
  useClickOutside(rootRef, () => setOpen(false));

  return (
    <div className="theme-switcher" ref={rootRef}>
      <button
        className="theme-switcher__trigger"
        onClick={() => setOpen(o => !o)}
        title="Change theme"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="theme-swatch theme-swatch--trigger" data-theme={palette}>
          <span className="theme-swatch__chip" />
        </span>
      </button>

      {open && (
        <div className="theme-switcher__panel" role="menu">
          <div className="theme-switcher__label">Color</div>
          <div className="theme-switcher__palettes">
            {PALETTES.map(option => (
              <button
                key={option.id}
                className={`theme-swatch-btn${palette === option.id ? " theme-swatch-btn--active" : ""}`}
                onClick={() => onPaletteChange(option.id)}
                title={option.label}
                aria-pressed={palette === option.id}
              >
                <span className="theme-swatch" data-theme={option.id}>
                  <span className="theme-swatch__chip" />
                </span>
                <span className="theme-swatch-btn__label">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="theme-switcher__label">Mode</div>
          <div className="theme-switcher__modes">
            {MODES.map(option => (
              <button
                key={option.id}
                className={`theme-mode-btn${mode === option.id ? " theme-mode-btn--active" : ""}`}
                onClick={() => onModeChange(option.id)}
                aria-pressed={mode === option.id}
              >
                <span aria-hidden="true">{option.icon}</span> {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
