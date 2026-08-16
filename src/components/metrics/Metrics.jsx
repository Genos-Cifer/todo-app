import { PRIORITIES, PRIORITY_COLORS, PRIORITY_BACKGROUNDS } from "../../constants/priorities";
import "./Metrics.css";

const RING_SIZE = 140;
const RING_STROKE = 10;

export function Metrics({ tasks, tags }) {
  const visibleTasks = tasks.filter(t => !t.backlog);
  const doneTasks = visibleTasks.filter(t => t.done);
  const pendingTasks = visibleTasks.filter(t => !t.done);
  const backlogTasks = tasks.filter(t => t.backlog);
  const total = visibleTasks.length;
  const completionPercent = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfDay);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const dueThisWeek = pendingTasks.filter(t => t.due && new Date(t.due) <= endOfWeek);
  const dueThisMonth = pendingTasks.filter(t => t.due && new Date(t.due) <= endOfMonth);
  const overdue = pendingTasks.filter(t => t.due && new Date(t.due) < startOfDay);
  const noDueDate = pendingTasks.filter(t => !t.due);

  const pendingByPriority = {};
  PRIORITIES.forEach(p => { pendingByPriority[p] = pendingTasks.filter(t => t.priority === p).length; });
  const maxPriorityCount = Math.max(...Object.values(pendingByPriority), 1);

  const pendingByTag = tags
    .map(tag => ({ ...tag, count: pendingTasks.filter(t => (t.tags || []).includes(tag.id)).length }))
    .sort((a, b) => b.count - a.count);
  const maxTagCount = Math.max(...pendingByTag.map(t => t.count), 1);

  const upcomingDeadlines = [...pendingTasks].filter(t => t.due).sort((a, b) => (a.due < b.due ? -1 : 1)).slice(0, 5);

  const radius = RING_SIZE / 2;
  const normalizedRadius = radius - RING_STROKE / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const dashOffset = circumference - (completionPercent / 100) * circumference;

  const completedThisWeek = doneTasks.filter(t => t.doneAt && new Date(t.doneAt) >= new Date(startOfDay.getTime() - 6 * 86400000)).length;

  const summaryItems = [
    ["✅", `${completedThisWeek} completed this week`],
    ["📋", `${pendingTasks.length} pending`],
    ["📦", `${backlogTasks.length} in backlog`],
    ["⚠️", `${overdue.length} overdue`],
    ["🔕", `${noDueDate.length} without due date`],
  ];

  return (
    <div className="metrics">
      <div className="metrics__row">
        <div className="metrics__card"><div className="metrics__icon">📋</div><div className="metrics__value">{pendingTasks.length}</div><div className="metrics__label">Pending tasks</div></div>
        <div className="metrics__card"><div className="metrics__icon">⚠️</div><div className="metrics__value" style={{ color: overdue.length > 0 ? "var(--color-danger)" : "var(--color-text-primary)" }}>{overdue.length}</div><div className="metrics__label">Overdue</div></div>
        <div className="metrics__card"><div className="metrics__icon">📅</div><div className="metrics__value">{dueThisWeek.length}</div><div className="metrics__label">Due this week</div></div>
        <div className="metrics__card"><div className="metrics__icon">🗓️</div><div className="metrics__value">{dueThisMonth.length}</div><div className="metrics__label">Due this month</div></div>
      </div>

      <div className="metrics__row">
        <div className="metrics__card" style={{ alignItems: "center" }}>
          <div className="metrics__label" style={{ alignSelf: "flex-start" }}>Overall progress</div>
          <div className="metrics__ring-wrap">
            <div className="metrics__ring">
              <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
                <circle cx={radius} cy={radius} r={normalizedRadius} fill="none" stroke="var(--color-surface-3)" strokeWidth={RING_STROKE} />
                <circle
                  cx={radius} cy={radius} r={normalizedRadius} fill="none"
                  stroke={completionPercent === 100 ? "var(--color-success)" : "var(--color-accent)"}
                  strokeWidth={RING_STROKE}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${radius} ${radius})`}
                  style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
                />
              </svg>
              <div className="metrics__ring-text">
                <div className="metrics__ring-pct">{completionPercent}%</div>
                <div className="metrics__ring-sub">{doneTasks.length} of {total} done</div>
              </div>
            </div>
          </div>
        </div>
        <div className="metrics__card" style={{ justifyContent: "center", gap: 12 }}>
          <div className="metrics__label">Quick summary</div>
          <div className="metrics__summary">
            {summaryItems.map(([icon, label], i) => (
              <div key={i} className="metrics__summary-item">
                <span className="metrics__summary-icon">{icon}</span>
                <span className="metrics__summary-text">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="metrics__section">
        <div className="metrics__section-title">Pending by Priority</div>
        <div className="metrics__card">
          <div className="metrics__bar-group">
            {PRIORITIES.map(p => (
              <div key={p} className="metrics__bar-item">
                <span className="metrics__bar-label" style={{ color: PRIORITY_COLORS[p] }}>{p}</span>
                <div className="metrics__bar-track"><div className="metrics__bar-fill" style={{ width: `${(pendingByPriority[p] / maxPriorityCount) * 100}%`, background: PRIORITY_COLORS[p] }} /></div>
                <span className="metrics__bar-value">{pendingByPriority[p]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pendingByTag.length > 0 && (
        <div className="metrics__section">
          <div className="metrics__section-title">Pending by Tag</div>
          <div className="metrics__card">
            <div className="metrics__bar-group">
              {pendingByTag.map(tag => (
                <div key={tag.id} className="metrics__bar-item">
                  <span className="metrics__bar-label" style={{ color: tag.color }}>{tag.name}</span>
                  <div className="metrics__bar-track"><div className="metrics__bar-fill" style={{ width: `${tag.count > 0 ? (tag.count / maxTagCount) * 100 : 0}%`, background: tag.color }} /></div>
                  <span className="metrics__bar-value">{tag.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="metrics__section">
        <div className="metrics__section-title">Upcoming deadlines</div>
        {upcomingDeadlines.length === 0 ? (
          <div className="metrics__empty">No upcoming deadlines</div>
        ) : (
          <div className="metrics__timeline">
            {upcomingDeadlines.map(t => {
              const dueDate = new Date(t.due);
              const isOverdue = dueDate < startOfDay;
              const isToday = t.due === startOfDay.toISOString().split("T")[0];
              const label = isOverdue ? "Overdue" : isToday ? "Today" : dueDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
              return (
                <div key={t.id} className="metrics__timeline-row">
                  <div className="metrics__timeline-dot" style={{ background: PRIORITY_COLORS[t.priority] }} />
                  <div className="metrics__timeline-info">
                    <div className="metrics__timeline-name">{t.title}</div>
                    <div className="metrics__timeline-due" style={{ color: isOverdue ? "var(--color-danger)" : "var(--color-text-tertiary)" }}>{label}</div>
                  </div>
                  <span className="metrics__timeline-badge" style={{ background: PRIORITY_BACKGROUNDS[t.priority], color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
