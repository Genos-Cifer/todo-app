import { PRIORITY_COLORS, withAlpha } from "../../constants/priorities";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ProfileMenu } from "./ProfileMenu";
import { SearchBar } from "./SearchBar";
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
  palette,
  onPaletteChange,
  mode,
  onModeChange,
  username,
  email,
  avatarUrl,
  onSignOut,
  searchQuery,
  onSearchChange,
  searchResultCount,
  showSearch,
  onOpenPalette,
  onOpenNotifications,
  notificationsActive,
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
        {showSearch && <SearchBar value={searchQuery} onChange={onSearchChange} resultCount={searchResultCount} />}

        <button className="palette-trigger" onClick={onOpenPalette} title="Open command palette">
          <span aria-hidden="true">⌘</span>K
        </button>

        {hasActiveFilters && (
          <div className="active-filters">
            {filterPriorities.map(p => (
              <span key={p} className="active-filter-pill" style={{ color: PRIORITY_COLORS[p], borderColor: withAlpha(PRIORITY_COLORS[p], 40) }}>
                {p}<button onClick={() => onTogglePriorityFilter(p)}>✕</button>
              </span>
            ))}
            {filterTags.map(id => {
              const tag = tags.find(t => t.id === id);
              return tag ? (
                <span key={id} className="active-filter-pill tag-chip" style={{ "--tag-color": tag.color }}>
                  {tag.name}<button onClick={() => onToggleTagFilter(id)}>✕</button>
                </span>
              ) : null;
            })}
          </div>
        )}
        {showNewTaskButton && <button className="btn-new-task" onClick={onNewTask}>+ New task</button>}
        {showClearCompleted && (
          <button className="btn-secondary" style={{ borderColor: "color-mix(in srgb, var(--color-danger) 30%, transparent)", color: "var(--color-danger)" }} onClick={onClearCompleted}>🗑 Clear completed</button>
        )}
        <ThemeSwitcher palette={palette} onPaletteChange={onPaletteChange} mode={mode} onModeChange={onModeChange} />
        <ProfileMenu
          username={username}
          email={email}
          avatarUrl={avatarUrl}
          onSignOut={onSignOut}
          onOpenNotifications={onOpenNotifications}
          notificationsActive={notificationsActive}
        />
      </div>
    </div>
  );
}
