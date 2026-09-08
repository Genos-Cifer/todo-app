import { useState } from "react";
import { PRIORITIES, PRIORITY_COLORS, withAlpha } from "../../constants/priorities";
import "../../styles/shared.css";

// Create/edit form for a task. Pass `task` to edit, omit it to create a new one.
export function TaskModal({ task, tags, defaultBacklog, onSave, onCancel }) {
  const [title, setTitle] = useState(task?.title || "");
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [dueDate, setDueDate] = useState(task?.due || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [selectedTagIds, setSelectedTagIds] = useState(task?.tags || []);
  const [backlog, setBacklog] = useState(task?.backlog || defaultBacklog || false);

  const toggleTag = tagId => setSelectedTagIds(ids => (ids.includes(tagId) ? ids.filter(id => id !== tagId) : [...ids, tagId]));

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...(task || {}), title: title.trim(), priority, due: dueDate, notes, tags: selectedTagIds, backlog, subtasks: task?.subtasks || [] });
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-header">
        <h2>{task ? "Edit task" : "New task"}</h2>
        <button className="icon-btn icon-btn--ghost" style={{ fontSize: 16 }} onClick={onCancel}>✕</button>
      </div>
      <div className="modal-body">
        <div className="field">
          <label className="field-label">Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs doing?"
            autoFocus
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSave()}
          />
        </div>
        <div className="field">
          <label className="field-label">Priority</label>
          <div className="priority-options">
            {PRIORITIES.map(p => (
              <button
                key={p}
                className={`priority-option${priority === p ? " priority-option--selected" : ""}`}
                style={priority === p ? { borderColor: PRIORITY_COLORS[p], background: PRIORITY_COLORS[p] } : { borderColor: withAlpha(PRIORITY_COLORS[p], 50), color: PRIORITY_COLORS[p] }}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label">Due date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context…" />
        </div>
        {tags.length > 0 && (
          <div className="field">
            <label className="field-label">Tags</label>
            <div className="tag-options">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-pill tag-chip tag-chip--button${selectedTagIds.includes(tag.id) ? " tag-chip--on" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                  style={{ "--tag-color": tag.color }}
                >
                  {selectedTagIds.includes(tag.id) && "✓ "}{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="field">
          <label className="checkbox-row">
            <input type="checkbox" checked={backlog} onChange={e => setBacklog(e.target.checked)} />
            <span>Add to Backlog</span>
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={!title.trim()}>Save task</button>
      </div>
    </div>
  );
}
