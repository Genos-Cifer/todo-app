import { PRIORITY_COLORS } from "../../constants/priorities";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ProfileMenu } from "./ProfileMenu";
import "./Topbar.css";

export function Topbar({
  title,
  itemCount,
  showViewToggle,
  viewMode,
  onViewModeChange,
  filterPriorities,
  onTogglePriorityFilter,
  filterTags,
  tags,
  onToggleTagFilter,
  hasActiveFilters,
  showNewTaskButton,
  onNewTask,
  showClearCompleted,
  onClearCompleted,
  theme,
  onThemeChange,
  username,
  email,
  avatarUrl,
  onSignOut,
}) {
  return (
    <div className="topbar">
      <div className="topbar__left">
        <div>
          <div className="topbar__title">{title}</div>
          <div className="topbar__subtitle">{typeof itemCount === "number" ? `${itemCount} ${itemCount === 1 ? "item" : "items"}` : ""}</div>
        </div>
        {showViewToggle && (
          <div className="view-toggle">
            <button className={`view-toggle__btn${viewMode === "normal" ? " view-toggle__btn--active" : ""}`} onClick={() => onViewModeChange("normal")}>☰ List</button>
            <button className={`view-toggle__btn${viewMode === "calendar" ? " view-toggle__btn--active" : ""}`} onClick={() => onViewModeChange("calendar")}>📅 Calendar</button>
          </div>
        )}
      </div>
      <div className="topbar__right">
        <ThemeSwitcher theme={theme} onChange={onThemeChange} />
        {hasActiveFilters && (
          <div className="active-filters">
            {filterPriorities.map(p => (
              <span key={p} className="active-filter-pill" style={{ color: PRIORITY_COLORS[p], borderColor: PRIORITY_COLORS[p] + "66" }}>
                {p}<button onClick={() => onTogglePriorityFilter(p)}>✕</button>
              </span>
            ))}
            {filterTags.map(id => {
              const tag = tags.find(t => t.id === id);
              return tag ? (
                <span key={id} className="active-filter-pill" style={{ color: tag.color, borderColor: tag.color + "66" }}>
                  {tag.name}<button onClick={() => onToggleTagFilter(id)}>✕</button>
                </span>
              ) : null;
            })}
          </div>
        )}
        {showNewTaskButton && <button className="btn-new-task" onClick={onNewTask}>+ New task</button>}
        {showClearCompleted && (
          <button className="btn-secondary" style={{ borderColor: "rgba(var(--color-danger-rgb),0.3)", color: "var(--color-danger)" }} onClick={onClearCompleted}>🗑 Clear completed</button>
        )}
        <ProfileMenu username={username} email={email} avatarUrl={avatarUrl} onSignOut={onSignOut} />
      </div>
    </div>
  );
}
