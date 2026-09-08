import { useEffect, useMemo, useRef, useState } from "react";
import { fuzzyMatch, highlightSegments } from "../../utils/fuzzy";
import { PRIORITIES, PRIORITY_COLORS } from "../../constants/priorities";
import { MODES, PALETTES } from "../../constants/themes";
import { formatShortDate } from "../../utils/date";
import "./CommandPalette.css";

// Groups render in this order regardless of individual match scores, so the
// palette's shape stays predictable as you type.
const GROUP_ORDER = ["Tasks", "Go to", "Actions", "Filter", "Theme", "Create"];
const MAX_PER_GROUP = { Tasks: 6, "Go to": 5, Actions: 6, Filter: 5, Theme: 7, Create: 1 };

export function CommandPalette({ open, onClose, tasks, tags, actions }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef();

  // A leading ">" restricts results to commands, the way Slack/VS Code style
  // palettes work. Everything stays searchable without it.
  const commandsOnly = query.trimStart().startsWith(">");
  const effectiveQuery = commandsOnly ? query.trimStart().slice(1).trim() : query.trim();

  const allItems = useMemo(
    () => buildItems({ tasks, tags, actions, commandsOnly, rawQuery: effectiveQuery }),
    [tasks, tags, actions, commandsOnly, effectiveQuery]
  );
  const groups = useMemo(() => rankItems(allItems, effectiveQuery), [allItems, effectiveQuery]);
  const flatItems = useMemo(() => groups.flatMap(group => group.items), [groups]);

  // Clamped rather than reset from an effect, so a shrinking result list can
  // never leave the highlight pointing past the end.
  const activeIndex = Math.min(selectedIndex, Math.max(flatItems.length - 1, 0));

  useEffect(() => {
    const selected = listRef.current?.querySelector("[data-selected='true']");
    selected?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, query]);

  if (!open) return null;

  const runItem = item => {
    if (!item) return;
    onClose();
    item.run();
  };

  const handleKeyDown = e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => (flatItems.length ? (Math.min(i, flatItems.length - 1) + 1) % flatItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => (flatItems.length ? (Math.min(i, flatItems.length - 1) - 1 + flatItems.length) % flatItems.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(flatItems[activeIndex]);
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  let renderIndex = -1;

  return (
    <div className="palette-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="palette__search">
          <span className="palette__search-icon" aria-hidden="true">⌘</span>
          <input
            className="palette__input"
            value={query}
            autoFocus
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, jump to a view, run a command…"
            aria-label="Command palette search"
          />
        </div>

        <div className="palette__results" ref={listRef}>
          {flatItems.length === 0 && (
            <div className="palette__empty">
              <div className="palette__empty-icon">🔍</div>
              <div>No matches for “{effectiveQuery}”</div>
            </div>
          )}

          {groups.map(group => (
            <div key={group.group} className="palette__group">
              <div className="palette__group-label">{group.group}</div>
              {group.items.map(item => {
                renderIndex++;
                const index = renderIndex;
                const isSelected = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    className={`palette__item${isSelected ? " palette__item--selected" : ""}`}
                    data-selected={isSelected}
                    onMouseMove={() => setSelectedIndex(index)}
                    onClick={() => runItem(item)}
                  >
                    <span className="palette__item-icon" style={item.iconColor ? { color: item.iconColor } : undefined}>
                      {item.icon}
                    </span>
                    <span className="palette__item-body">
                      <span className={`palette__item-label${item.strikethrough ? " palette__item-label--done" : ""}`}>
                        {highlightSegments(item.label, item.matchIndices).map((segment, i) =>
                          segment.matched
                            ? <mark key={i} className="palette__match">{segment.chunk}</mark>
                            : <span key={i}>{segment.chunk}</span>
                        )}
                      </span>
                      {item.subtitle && <span className="palette__item-subtitle">{item.subtitle}</span>}
                    </span>
                    {item.hint && <span className="palette__item-hint">{item.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="palette__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
          <span className="palette__footer-tip">
            <kbd>&gt;</kbd> commands only
          </span>
        </div>
      </div>
    </div>
  );
}

// ── item construction ───────────────────────────────────────────────────────

function buildItems({ tasks, tags, actions, commandsOnly, rawQuery }) {
  const items = [];

  if (!commandsOnly) {
    tasks.forEach(task => {
      const dueLabel = task.due ? formatShortDate(task.due) : null;
      const location = task.backlog ? "Backlog" : task.done ? "Completed" : "Active";
      items.push({
        id: `task-${task.id}`,
        group: "Tasks",
        icon: task.done ? "✓" : "•",
        iconColor: task.done ? "var(--color-success)" : PRIORITY_COLORS[task.priority],
        label: task.title,
        subtitle: [location, task.priority, dueLabel].filter(Boolean).join(" · "),
        hint: "open",
        strikethrough: task.done,
        keywords: `${task.notes || ""} ${(task.subtasks || []).map(s => s.text).join(" ")}`,
        run: () => actions.onOpenTask(task),
      });
    });
  }

  const navItems = [
    ["tasks", "Active Todos", "☰"],
    ["backlog", "Backlog", "📦"],
    ["done", "Completed", "✓"],
    ["metrics", "Metrics", "📊"],
    ["tagmgr", "Tags", "🏷"],
  ];
  navItems.forEach(([id, label, icon]) => {
    items.push({
      id: `nav-${id}`,
      group: "Go to",
      icon,
      label,
      keywords: "view navigate open go",
      run: () => actions.onNavigate(id),
    });
  });

  items.push(
    { id: "act-new", group: "Actions", icon: "➕", label: "New task", keywords: "create add todo", run: actions.onNewTask },
    { id: "act-list", group: "Actions", icon: "☰", label: "Switch to list view", keywords: "layout", run: () => actions.onSetViewMode("normal") },
    { id: "act-calendar", group: "Actions", icon: "📅", label: "Switch to calendar view", keywords: "layout month", run: () => actions.onSetViewMode("calendar") },
    { id: "act-sort-created", group: "Actions", icon: "🕑", label: "Sort by newest", keywords: "order created", run: () => actions.onSetSort("created") },
    { id: "act-sort-due", group: "Actions", icon: "📆", label: "Sort by due date", keywords: "order deadline", run: () => actions.onSetSort("due") },
    { id: "act-sort-priority", group: "Actions", icon: "🔺", label: "Sort by priority", keywords: "order important", run: () => actions.onSetSort("priority") },
    { id: "act-clear-filters", group: "Actions", icon: "✕", label: "Clear all filters", keywords: "reset", run: actions.onClearFilters },
    { id: "act-sidebar", group: "Actions", icon: "◧", label: "Toggle sidebar", keywords: "collapse expand", run: actions.onToggleSidebar },
    { id: "act-notifications", group: "Actions", icon: "🔔", label: "Notification settings", keywords: "remind alert due", run: actions.onOpenNotificationSettings },
    { id: "act-signout", group: "Actions", icon: "↪", label: "Log out", keywords: "sign exit", run: actions.onSignOut }
  );

  PRIORITIES.forEach(priority => {
    items.push({
      id: `filter-priority-${priority}`,
      group: "Filter",
      icon: "●",
      iconColor: PRIORITY_COLORS[priority],
      label: `Filter by priority: ${priority}`,
      keywords: "toggle",
      run: () => actions.onTogglePriorityFilter(priority),
    });
  });
  tags.forEach(tag => {
    items.push({
      id: `filter-tag-${tag.id}`,
      group: "Filter",
      icon: "●",
      iconColor: tag.color,
      label: `Filter by tag: ${tag.name}`,
      keywords: "toggle label",
      run: () => actions.onToggleTagFilter(tag.id),
    });
  });

  PALETTES.forEach(paletteOption => {
    items.push({
      id: `palette-${paletteOption.id}`,
      group: "Theme",
      icon: "◉",
      label: `Color: ${paletteOption.label}`,
      keywords: "theme palette appearance",
      run: () => actions.onSetPalette(paletteOption.id),
    });
  });
  MODES.forEach(modeOption => {
    items.push({
      id: `mode-${modeOption.id}`,
      group: "Theme",
      icon: modeOption.icon,
      label: `Mode: ${modeOption.label}`,
      keywords: "theme dark light system appearance",
      run: () => actions.onSetMode(modeOption.id),
    });
  });

  // Always offered while typing, so the palette doubles as a quick-add box.
  if (rawQuery) {
    items.push({
      id: "create-task",
      group: "Create",
      icon: "✨",
      label: `Create task “${rawQuery}”`,
      hint: "↵",
      alwaysShow: true,
      run: () => actions.onCreateTaskWithTitle(rawQuery),
    });
  }

  return items;
}

// ── ranking ─────────────────────────────────────────────────────────────────

// With no query we show a curated default set; with one, everything is fuzzy
// matched on its label (falling back to hidden keywords) and ranked by score.
function rankItems(items, query) {
  const scored = [];

  for (const item of items) {
    if (!query) {
      if (item.group === "Tasks" || item.group === "Filter" || item.group === "Theme") continue;
      scored.push({ ...item, matchIndices: [], score: 0 });
      continue;
    }

    // The "create task" fallback always sits last, never ranked against others.
    if (item.alwaysShow) {
      scored.push({ ...item, matchIndices: [], score: -Infinity });
      continue;
    }

    const labelMatch = fuzzyMatch(query, item.label);
    if (labelMatch) {
      scored.push({ ...item, matchIndices: labelMatch.indices, score: labelMatch.score });
      continue;
    }
    const keywordMatch = item.keywords ? fuzzyMatch(query, item.keywords) : null;
    if (keywordMatch) {
      scored.push({ ...item, matchIndices: [], score: keywordMatch.score - 10 });
    }
  }

  const groups = [];
  for (const groupName of GROUP_ORDER) {
    const groupItems = scored
      .filter(item => item.group === groupName)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_PER_GROUP[groupName] ?? 5);
    if (groupItems.length) groups.push({ group: groupName, items: groupItems });
  }
  return groups;
}
