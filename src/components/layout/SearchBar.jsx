import { useEffect, useRef } from "react";
import "./SearchBar.css";

export function SearchBar({ value, onChange, resultCount }) {
  const inputRef = useRef();

  // "/" focuses the search box the way it does in most list-heavy apps,
  // unless the user is already typing into some other field.
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasQuery = value.trim().length > 0;

  return (
    <div className={`search-bar${hasQuery ? " search-bar--active" : ""}`}>
      <span className="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        ref={inputRef}
        className="search-bar__input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Escape" && hasQuery) {
            e.stopPropagation();
            onChange("");
          }
        }}
        placeholder="Search tasks…"
        aria-label="Search tasks"
      />
      {hasQuery ? (
        <>
          <span className="search-bar__count">{resultCount}</span>
          <button className="search-bar__clear" onClick={() => onChange("")} title="Clear search">✕</button>
        </>
      ) : (
        <kbd className="search-bar__kbd">/</kbd>
      )}
    </div>
  );
}
