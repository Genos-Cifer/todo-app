import { TaskCard } from "./TaskCard";
import { EmptyState } from "../common/EmptyState";

// Renders a list of task cards, or an empty state when there's nothing to show.
export function TaskList({ tasks, tags, onUpdate, onDelete, onEdit, onMarkDone, emptyState }) {
  if (tasks.length === 0) return <EmptyState {...emptyState} />;
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          tags={tags}
          onUpdate={onUpdate}
          onDelete={() => onDelete(task.id)}
          onEdit={() => onEdit(task)}
          onMarkDone={onMarkDone}
        />
      ))}
    </div>
  );
}
