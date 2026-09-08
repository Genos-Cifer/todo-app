import { useRef, useState } from "react";
import { generateId } from "../../utils/id";
import { formatShortDate, formatLongDate } from "../../utils/date";
import { PRIORITY_COLORS, PRIORITY_BACKGROUNDS } from "../../constants/priorities";
import "./TaskCard.css";

export function TaskCard({ task, tags, onUpdate, onDelete, onEdit, onMarkDone }) {
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [subtaskTagPickerId, setSubtaskTagPickerId] = useState(null);
  const newSubtaskInputRef = useRef();

  const taskTags = tags.filter(tag => (task.tags || []).includes(tag.id));
  const subtasks = task.subtasks || [];
  const doneCount = subtasks.filter(s => s.done).length;
  const progressPercent = subtasks.length ? Math.round((doneCount / subtasks.length) * 100) : 0;
  const isOverdue = task.due && !task.done && new Date(task.due) < new Date();

  const addSubtask = () => {
    if (!newSubtaskText.trim()) return;
    onUpdate({ ...task, subtasks: [...subtasks, { id: generateId(), text: newSubtaskText.trim(), done: false, tags: [] }] });
    setNewSubtaskText("");
  };
  const toggleSubtask = subtaskId => {
    onUpdate({ ...task, subtasks: subtasks.map(s => (s.id === subtaskId ? { ...s, done: !s.done } : s)) });
  };
  const deleteSubtask = subtaskId => {
    onUpdate({ ...task, subtasks: subtasks.filter(s => s.id !== subtaskId) });
  };
  const toggleSubtaskTag = (subtaskId, tagId) => {
    onUpdate({
      ...task,
      subtasks: subtasks.map(s =>
        s.id === subtaskId
          ? { ...s, tags: (s.tags || []).includes(tagId) ? (s.tags || []).filter(id => id !== tagId) : [...(s.tags || []), tagId] }
          : s
      ),
    });
  };

  const expandSubtasks = () => {
    setSubtasksOpen(open => {
      const next = !open;
      if (next) setTimeout(() => newSubtaskInputRef.current?.focus(), 80);
      return next;
    });
  };

  return (
    <div className={`task-card${task.done ? " task-card--done" : ""}`} style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || "#555"}` }}>
      <div className="task-card__body">
        <div
          className={`task-card__checkbox${task.done ? " task-card__checkbox--checked" : ""}`}
          role="checkbox"
          aria-checked={!!task.done}
          tabIndex={0}
          onClick={() => onMarkDone(task, !task.done)}
          onKeyDown={e => (e.key === " " || e.key === "Enter") && onMarkDone(task, !task.done)}
        >
          {task.done && "✓"}
        </div>
        <div className="task-card__info">
          <div className={`task-card__title${task.done ? " task-card__title--done" : ""}`}>{task.title}</div>
          {task.done ? (
            <div className="task-card__done-label">✔ Completed {formatLongDate(task.doneAt)}</div>
          ) : (
            <div className="task-card__meta">
              <span className="task-card__priority-badge" style={{ background: PRIORITY_BACKGROUNDS[task.priority], color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
              {task.due && (
                <span className={`task-card__due-badge${isOverdue ? " task-card__due-badge--overdue" : ""}`}>
                  {isOverdue ? "⚠ " : ""}{formatShortDate(task.due)}
                </span>
              )}
              {taskTags.map(tag => (
                <span key={tag.id} className="task-tag-pill tag-chip" style={{ "--tag-color": tag.color }}>{tag.name}</span>
              ))}
            </div>
          )}
          {task.notes && !task.done && <div className="task-card__notes">{task.notes}</div>}
          {subtasks.length > 0 && !task.done && (
            <div className="task-card__progress">
              <div className="task-card__progress-track">
                <div className="task-card__progress-fill" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "var(--color-success)" : PRIORITY_COLORS[task.priority] }} />
              </div>
              <span className="task-card__progress-label">{doneCount}/{subtasks.length}</span>
            </div>
          )}
        </div>
        <div className="task-card__actions">
          {!task.done && (
            <button className="icon-btn" title={subtasksOpen ? "Collapse subtasks" : "Expand subtasks"} onClick={expandSubtasks}>
              {subtasksOpen ? "▲" : "▼"}
            </button>
          )}
          <button className="icon-btn" title="Edit task" onClick={onEdit}>✎</button>
          {!task.done && (
            <button className="icon-btn" title={task.backlog ? "Move to Active" : "Move to Backlog"} onClick={() => onUpdate({ ...task, backlog: !task.backlog })}>
              {task.backlog ? "↩" : "📦"}
            </button>
          )}
          <button className="icon-btn icon-btn--danger" title="Delete task" onClick={onDelete}>🗑</button>
        </div>
      </div>

      {!subtasksOpen && subtasks.length > 0 && !task.done && (
        <button className="task-card__subtasks-toggle" onClick={() => setSubtasksOpen(true)}>▸ {doneCount} of {subtasks.length} subtasks done</button>
      )}

      {subtasksOpen && !task.done && (
        <div className="task-card__subtasks">
          {subtasks.length > 0 && (
            <div className="task-card__subtask-list">
              {subtasks.map(subtask => {
                const subtaskTags = tags.filter(tag => (subtask.tags || []).includes(tag.id));
                return (
                  <div key={subtask.id}>
                    <div className="task-card__subtask-item">
                      <div
                        className={`task-card__checkbox${subtask.done ? " task-card__checkbox--checked" : ""}`}
                        style={{ width: 15, height: 15, fontSize: 9, borderRadius: 5, marginTop: 1 }}
                        onClick={() => toggleSubtask(subtask.id)}
                      >
                        {subtask.done && "✓"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={`task-card__subtask-text${subtask.done ? " task-card__subtask-text--done" : ""}`}>{subtask.text}</div>
                        {subtaskTags.length > 0 && (
                          <div className="task-card__subtask-tags">
                            {subtaskTags.map(tag => (
                              <span key={tag.id} className="task-tag-pill tag-chip" style={{ "--tag-color": tag.color, fontSize: 9 }}>{tag.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="icon-btn icon-btn--small" title="Tag subtask" onClick={() => setSubtaskTagPickerId(subtaskTagPickerId === subtask.id ? null : subtask.id)}>🏷</button>
                      <button className="icon-btn icon-btn--danger icon-btn--small" title="Remove subtask" onClick={() => deleteSubtask(subtask.id)}>✕</button>
                    </div>
                    {subtaskTagPickerId === subtask.id && (
                      <div className="task-card__subtask-tag-picker">
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            className={`tag-pill tag-chip tag-chip--button${(subtask.tags || []).includes(tag.id) ? " tag-chip--on" : ""}`}
                            onClick={() => toggleSubtaskTag(subtask.id, tag.id)}
                            style={{ "--tag-color": tag.color, fontSize: 10, padding: "3px 9px" }}
                          >
                            {(subtask.tags || []).includes(tag.id) && "✓ "}{tag.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="task-card__subtask-form">
            <input
              ref={newSubtaskInputRef}
              value={newSubtaskText}
              onChange={e => setNewSubtaskText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSubtask()}
              placeholder="Add subtask…"
            />
            <button onClick={addSubtask}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
