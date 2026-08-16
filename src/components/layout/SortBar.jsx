import "./Topbar.css";

const SORT_OPTIONS = [
  ["created", "Newest"],
  ["due", "Due date"],
  ["priority", "Priority"],
];

export function SortBar({ sortBy, onSortChange }) {
  return (
    <div className="sort-bar">
      <span className="sort-bar__label">Sort</span>
      {SORT_OPTIONS.map(([value, label]) => (
        <button key={value} className={`sort-chip${sortBy === value ? " sort-chip--active" : ""}`} onClick={() => onSortChange(value)}>{label}</button>
      ))}
    </div>
  );
}
