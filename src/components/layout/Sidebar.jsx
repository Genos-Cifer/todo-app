import { PRIORITIES, PRIORITY_COLORS } from "../../constants/priorities";
import "./Sidebar.css";

// navItems: [{ id, label, icon, count, tip }]
export function Sidebar({
  navItems,
  view,
  onSelectView,
  sidebarOpen,
  onToggleSidebar,
  tags,
  filterPriorities,
  onTogglePriorityFilter,
  filterTags,
  onToggleTagFilter,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div className={`sidebar${sidebarOpen ? "" : " sidebar--collapsed"}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo-icon">✓</div>
        <span className="sidebar__logo-text">TaskFlow</span>
        <button className="sidebar__toggle" onClick={onToggleSidebar} title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
          <span className="sidebar__toggle-label">{sidebarOpen ? "Close" : ""}</span>
          <span className="sidebar__toggle-arrow">◀</span>
        </button>
      </div>

      {/* Collapsed mini icons */}
      <div className="sidebar__mini">
        {navItems.map(item => (
          <button key={item.id} className={`sidebar__mini-btn${view === item.id ? " sidebar__mini-btn--active" : ""}`} onClick={() => onSelectView(item.id)} title={item.label}>
            <span>{item.icon}</span>
            {item.count > 0 && item.id !== "tagmgr" && <span className="sidebar__mini-dot" />}
          </button>
        ))}
        <div style={{ height: 1, width: 24, background: "var(--color-border-subtle)", margin: "4px 0" }} />
        {hasActiveFilters && (
          <button className="sidebar__mini-btn" onClick={onClearFilters} title="Clear filters" style={{ color: "var(--color-danger)" }}>✕</button>
        )}
      </div>

      {/* Full sidebar body */}
      <div className="sidebar__body">
        <div className="sidebar__section-label">Views</div>
        <div className="sidebar__nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item${view === item.id ? " nav-item--active" : ""}`} onClick={() => onSelectView(item.id)}>
              <span className="nav-item__icon">{item.icon}</span>
              <span className="nav-item__text">{item.label}</span>
              {item.count > 0 && <span className={`nav-item__count${item.id === "done" ? " nav-item__count--success" : ""}`}>{item.count}</span>}
              <span className="nav-item__tip">{item.tip}</span>
            </button>
          ))}
        </div>

        <div className="sidebar__divider" />
        <div className="sidebar__section-label">Priority</div>
        <div className="sidebar__filters">
          {PRIORITIES.map(p => (
            <button key={p} className={`filter-btn${filterPriorities.includes(p) ? " filter-btn--active" : ""}`} onClick={() => onTogglePriorityFilter(p)}>
              <span className="filter-btn__dot" style={{ background: PRIORITY_COLORS[p] }} />
              <span style={{ flex: 1, color: filterPriorities.includes(p) ? PRIORITY_COLORS[p] : undefined }}>{p}</span>
              <span className="filter-btn__check" style={{ color: PRIORITY_COLORS[p] }}>✓</span>
            </button>
          ))}
        </div>

        <div className="sidebar__divider" />
        <div className="sidebar__section-label">Tags</div>
        <div className="sidebar__filters">
          {tags.length === 0 && <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", padding: "4px 12px" }}>No tags yet</div>}
          {tags.map(tag => (
            <button key={tag.id} className={`filter-btn${filterTags.includes(tag.id) ? " filter-btn--active" : ""}`} onClick={() => onToggleTagFilter(tag.id)}>
              <span className="filter-btn__dot" style={{ background: tag.color }} />
              <span style={{ flex: 1, color: filterTags.includes(tag.id) ? tag.color : undefined }}>{tag.name}</span>
              <span className="filter-btn__check" style={{ color: tag.color }}>✓</span>
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <>
            <div className="sidebar__divider" />
            <button className="sidebar__clear-btn" onClick={onClearFilters}>✕ Clear all filters</button>
          </>
        )}
      </div>
    </div>
  );
}
