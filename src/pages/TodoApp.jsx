import { useEffect, useState } from "react";
import { sortAndFilterTasks } from "../utils/tasks";
import { useToast } from "../hooks/useToast";
import { useTheme } from "../hooks/useTheme";
import { useEscapeKey } from "../hooks/useEscapeKey";
import * as tasksService from "../services/tasksService";
import * as tagsService from "../services/tagsService";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { SortBar } from "../components/layout/SortBar";
import { TaskList } from "../components/tasks/TaskList";
import { TaskModal } from "../components/tasks/TaskModal";
import { ConfirmDialog } from "../components/tasks/ConfirmDialog";
import { TagManager } from "../components/tags/TagManager";
import { CalendarView } from "../components/calendar/CalendarView";
import { Metrics } from "../components/metrics/Metrics";
import { Toast } from "../components/common/Toast";
import { LoadingScreen } from "../components/common/LoadingScreen";
import "../App.css";

const ERROR_TOAST = "⚠ Something went wrong — please try again";

export function TodoApp({ user, profile, onSignOut }) {
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  // Compared against user.id (rather than a separately-set boolean) so the
  // fetch effect below never needs a synchronous setState call — only the
  // async .then() continuation sets state.
  const [loadedUserId, setLoadedUserId] = useState(null);
  const isDataLoading = loadedUserId !== user.id;
  const [view, setView] = useState("tasks");
  const [filterTags, setFilterTags] = useState([]);
  const [filterPriorities, setFilterPriorities] = useState([]);
  const [sortBy, setSortBy] = useState("created");
  const [modal, setModal] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState("normal");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const { toastMessage, showToast } = useToast();
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    let cancelled = false;
    Promise.all([tasksService.fetchTasks(user.id), tagsService.fetchTags(user.id)])
      .then(([loadedTasks, loadedTags]) => {
        if (cancelled) return;
        setTasks(loadedTasks);
        setTags(loadedTags);
        setLoadedUserId(user.id);
      })
      .catch(() => !cancelled && showToast(ERROR_TOAST));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEscapeKey(() => {
    if (confirmDeleteId) setConfirmDeleteId(null);
    else if (modal) setModal(null);
  });

  const togglePriorityFilter = p => setFilterPriorities(list => (list.includes(p) ? list.filter(x => x !== p) : [...list, p]));
  const toggleTagFilter = id => setFilterTags(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]));
  const clearFilters = () => { setFilterPriorities([]); setFilterTags([]); };

  // Updates a task, auto-completing it when every subtask has just been checked off.
  const handleTaskUpdate = async updatedTask => {
    const subtasks = updatedTask.subtasks || [];
    const allSubtasksDone = subtasks.length > 0 && subtasks.every(s => s.done);
    const finalTask = allSubtasksDone && !updatedTask.done ? { ...updatedTask, done: true, doneAt: Date.now() } : updatedTask;
    if (finalTask.done && !updatedTask.done) showToast("✔ All subtasks done — task completed!");
    try {
      const saved = await tasksService.updateTask(user.id, finalTask);
      setTasks(ts => ts.map(t => (t.id === saved.id ? saved : t)));
    } catch {
      showToast(ERROR_TOAST);
    }
  };

  // Creates a new task or saves edits to an existing one (from the task modal).
  const handleSaveTask = async taskData => {
    const subtasks = taskData.subtasks || [];
    const allSubtasksDone = subtasks.length > 0 && subtasks.every(s => s.done);
    const finalTask = allSubtasksDone ? { ...taskData, done: true, doneAt: taskData.doneAt || Date.now() } : taskData;
    try {
      if (finalTask.id) {
        const saved = await tasksService.updateTask(user.id, finalTask);
        setTasks(ts => ts.map(t => (t.id === saved.id ? saved : t)));
        showToast("✎ Task updated");
      } else {
        const saved = await tasksService.createTask(user.id, { ...finalTask, done: false, subtasks: [] });
        setTasks(ts => [saved, ...ts]);
        showToast("✔ Task created");
      }
    } catch {
      showToast(ERROR_TOAST);
    }
  };

  const handleDeleteTask = async id => {
    try {
      await tasksService.deleteTask(user.id, id);
      setTasks(ts => ts.filter(t => t.id !== id));
      showToast("🗑 Task deleted");
    } catch {
      showToast(ERROR_TOAST);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleMarkDone = async (task, done) => {
    const finalTask = {
      ...task,
      done,
      doneAt: done ? Date.now() : undefined,
      subtasks: done ? (task.subtasks || []).map(s => ({ ...s, done: true })) : task.subtasks,
    };
    try {
      const saved = await tasksService.updateTask(user.id, finalTask);
      setTasks(ts => ts.map(t => (t.id === saved.id ? saved : t)));
      if (done) showToast("✔ Task completed!");
    } catch {
      showToast(ERROR_TOAST);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await tasksService.deleteCompletedTasks(user.id);
      setTasks(ts => ts.filter(t => !t.done));
      showToast("🗑 All completed tasks cleared");
    } catch {
      showToast(ERROR_TOAST);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleCreateTag = async tagData => {
    try {
      const saved = await tagsService.createTag(user.id, tagData);
      setTags(ts => [...ts, saved]);
      showToast("✔ Tag created");
    } catch {
      showToast(ERROR_TOAST);
    }
  };

  const handleUpdateTag = async tagData => {
    try {
      const saved = await tagsService.updateTag(user.id, tagData);
      setTags(ts => ts.map(t => (t.id === saved.id ? saved : t)));
      showToast("✎ Tag updated");
    } catch {
      showToast(ERROR_TOAST);
    }
  };

  const handleDeleteTag = async tagId => {
    try {
      await tagsService.deleteTag(user.id, tagId);
      setTags(ts => ts.filter(t => t.id !== tagId));
      showToast("🗑 Tag deleted");
    } catch {
      showToast(ERROR_TOAST);
    }
  };

  const activeTasks = tasks.filter(t => !t.backlog && !t.done);
  const completedTasks = tasks.filter(t => t.done && !t.backlog);
  const backlogTasks = tasks.filter(t => t.backlog);

  const visibleTasksFor = list => sortAndFilterTasks(list, { filterPriorities, filterTags, sortBy });

  const taskPendingDelete = confirmDeleteId ? tasks.find(t => t.id === confirmDeleteId) : null;
  const hasActiveFilters = filterPriorities.length > 0 || filterTags.length > 0;

  const navItems = [
    { id: "tasks", label: "Active Todos", icon: "☰", count: activeTasks.length, tip: "Your current tasks that need attention. Focus on what matters today." },
    { id: "backlog", label: "Backlog", icon: "📦", count: backlogTasks.length, tip: "Tasks parked for later. Move items here when they're not a priority yet." },
    { id: "done", label: "Completed", icon: "✓", count: completedTasks.length, tip: "All finished tasks. Review your accomplishments or clear them out." },
    { id: "metrics", label: "Metrics", icon: "📊", count: null, tip: "See your productivity stats, progress, and upcoming deadlines at a glance." },
    { id: "tagmgr", label: "Tags", icon: "🏷", count: tags.length, tip: "Create and manage tags to organize your tasks by category or context." },
  ];
  const currentNavItem = navItems.find(item => item.id === view);
  const showSortBar = viewMode === "normal" && (view === "tasks" || view === "backlog");
  const openNewTaskModal = () => setModal({ mode: "new", backlog: view === "backlog" });
  const openEditTaskModal = task => setModal({ mode: "edit", task });

  const taskListHandlers = {
    onUpdate: handleTaskUpdate,
    onDelete: setConfirmDeleteId,
    onEdit: openEditTaskModal,
    onMarkDone: handleMarkDone,
  };

  if (isDataLoading) return <LoadingScreen label="Loading your tasks…" />;

  return (
    <>
      <div className="app">
        <Sidebar
          navItems={navItems}
          view={view}
          onSelectView={setView}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          tags={tags}
          filterPriorities={filterPriorities}
          onTogglePriorityFilter={togglePriorityFilter}
          filterTags={filterTags}
          onToggleTagFilter={toggleTagFilter}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <div className="app-main">
          <Topbar
            title={currentNavItem?.label}
            itemCount={currentNavItem?.count}
            showViewToggle={view === "tasks" || view === "backlog"}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterPriorities={filterPriorities}
            onTogglePriorityFilter={togglePriorityFilter}
            filterTags={filterTags}
            tags={tags}
            onToggleTagFilter={toggleTagFilter}
            hasActiveFilters={hasActiveFilters}
            showNewTaskButton={view === "tasks" || view === "backlog"}
            onNewTask={openNewTaskModal}
            showClearCompleted={view === "done" && completedTasks.length > 0}
            onClearCompleted={() => setConfirmDeleteId("__all__")}
            theme={theme}
            onThemeChange={setTheme}
            username={profile.username}
            email={user.email}
            avatarUrl={profile.avatarUrl}
            onSignOut={onSignOut}
          />

          {showSortBar && <SortBar sortBy={sortBy} onSortChange={setSortBy} />}

          <div className="app-content">
            {view === "tagmgr" && <TagManager tags={tags} onCreate={handleCreateTag} onUpdate={handleUpdateTag} onDelete={handleDeleteTag} />}
            {view === "metrics" && <Metrics tasks={tasks} tags={tags} />}

            {view === "tasks" && viewMode === "normal" && (
              <TaskList
                tasks={visibleTasksFor(activeTasks)}
                tags={tags}
                {...taskListHandlers}
                emptyState={{
                  icon: "🌙",
                  title: "All clear!",
                  subtitle: hasActiveFilters ? "No tasks match your filters. Try adjusting them." : "Your task list is empty. Ready to add something?",
                  ctaLabel: hasActiveFilters ? null : "+ Create your first task",
                  onCta: openNewTaskModal,
                }}
              />
            )}
            {view === "tasks" && viewMode === "calendar" && (
              <CalendarView tasks={activeTasks} tags={tags} month={calendarMonth} onMonthChange={setCalendarMonth} onEdit={openEditTaskModal} />
            )}

            {view === "backlog" && viewMode === "normal" && (
              <TaskList
                tasks={visibleTasksFor(backlogTasks)}
                tags={tags}
                {...taskListHandlers}
                emptyState={{
                  icon: "📦",
                  title: "Backlog is empty",
                  subtitle: hasActiveFilters ? "No backlog tasks match your filters." : "Tasks you park for later will appear here.",
                  ctaLabel: hasActiveFilters ? null : "+ Add a task",
                  onCta: openNewTaskModal,
                }}
              />
            )}
            {view === "backlog" && viewMode === "calendar" && (
              <CalendarView tasks={backlogTasks} tags={tags} month={calendarMonth} onMonthChange={setCalendarMonth} onEdit={openEditTaskModal} />
            )}

            {view === "done" && (
              <TaskList
                tasks={[...completedTasks].sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))}
                tags={tags}
                {...taskListHandlers}
                emptyState={{ icon: "🎯", title: "Nothing completed yet", subtitle: "Finished tasks will show up here." }}
              />
            )}
          </div>
        </div>
      </div>

      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <TaskModal
            task={modal.task}
            tags={tags}
            defaultBacklog={modal.backlog}
            onSave={taskData => { handleSaveTask(taskData); setModal(null); }}
            onCancel={() => setModal(null)}
          />
        </div>
      )}

      {confirmDeleteId && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setConfirmDeleteId(null)}>
          <ConfirmDialog
            title={confirmDeleteId === "__all__" ? "Clear completed?" : "Delete task?"}
            message={
              confirmDeleteId === "__all__"
                ? `Permanently remove all ${completedTasks.length} completed tasks? This action cannot be undone.`
                : `"${taskPendingDelete?.title}" will be permanently deleted.`
            }
            onConfirm={() => (confirmDeleteId === "__all__" ? handleClearCompleted() : handleDeleteTask(confirmDeleteId))}
            onCancel={() => setConfirmDeleteId(null)}
          />
        </div>
      )}

      <Toast message={toastMessage} />
    </>
  );
}
