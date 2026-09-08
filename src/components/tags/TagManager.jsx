import { useState } from "react";
import { TAG_COLOR_PALETTE } from "../../constants/priorities";
import { EmptyState } from "../common/EmptyState";
import "../../styles/shared.css";
import "./TagManager.css";

export function TagManager({ tags, onCreate, onUpdate, onDelete }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLOR_PALETTE[0]);
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => { setEditingId(null); setName(""); setColor(TAG_COLOR_PALETTE[0]); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) onUpdate({ id: editingId, name: name.trim(), color });
    else onCreate({ name: name.trim(), color });
    resetForm();
  };

  const startEdit = tag => { setEditingId(tag.id); setName(tag.name); setColor(tag.color); };

  return (
    <div className="tag-manager">
      <div className="tag-form">
        <h3>{editingId ? "Edit tag" : "Create a tag"}</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, minWidth: 130, marginBottom: 0 }}>
            <label className="field-label">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} placeholder="Tag name…" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Color</label>
            <div className="tag-form__color-dots">
              {TAG_COLOR_PALETTE.map(c => (
                <div key={c} className={`tag-form__color-dot${color === c ? " tag-form__color-dot--selected" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
        </div>
        {name.trim() && (
          <div style={{ marginTop: 12 }}>
            <span className="tag-preview-pill tag-chip" style={{ "--tag-color": color }}>{name}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {editingId && <button className="btn-secondary" onClick={resetForm}>Cancel</button>}
          <button className="btn-primary" style={{ padding: "7px 20px", fontSize: 12 }} onClick={handleSave}>{editingId ? "Update" : "Create tag"}</button>
        </div>
      </div>
      {tags.length === 0 ? (
        <EmptyState icon="🏷" title="No tags yet" subtitle="Create your first tag above." />
      ) : (
        tags.map(tag => (
          <div key={tag.id} className="tag-row">
            <div className="tag-row__dot" style={{ background: tag.color }} />
            <span className="tag-row__name">{tag.name}</span>
            <span className="tag-preview-pill tag-chip" style={{ "--tag-color": tag.color }}>{tag.name}</span>
            <button className="icon-btn icon-btn--ghost" title="Edit tag" onClick={() => startEdit(tag)}>✎</button>
            <button className="icon-btn icon-btn--danger icon-btn--ghost" title="Delete tag" onClick={() => onDelete(tag.id)}>🗑</button>
          </div>
        ))
      )}
    </div>
  );
}
