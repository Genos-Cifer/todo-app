import { PRIORITY_COLORS, PRIORITY_BACKGROUNDS } from "../../constants/priorities";
import "./CalendarView.css";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_TASKS_SHOWN = 3;

export function CalendarView({ tasks, month, onMonthChange, onEdit }) {
  const { y, m } = month;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthName = new Date(y, m).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const goToPrevMonth = () => onMonthChange(m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const goToNextMonth = () => onMonthChange(m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });
  const goToToday = () => onMonthChange({ y: today.getFullYear(), m: today.getMonth() });

  const tasksByDate = {};
  tasks.forEach(t => { if (t.due) tasksByDate[t.due] = [...(tasksByDate[t.due] || []), t]; });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__title">{monthName}</div>
        <div className="calendar__nav">
          <button className="calendar__today-btn" onClick={goToToday}>Today</button>
          <button className="calendar__nav-btn" onClick={goToPrevMonth}>◀</button>
          <button className="calendar__nav-btn" onClick={goToNextMonth}>▶</button>
        </div>
      </div>
      <div className="calendar__grid">
        {DAY_LABELS.map(d => <div key={d} className="calendar__dow">{d}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty${i}`} className="calendar__cell calendar__cell--empty" />;
          const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isPast = new Date(dateStr) < new Date(todayStr);
          const dayTasks = tasksByDate[dateStr] || [];
          const shown = dayTasks.slice(0, MAX_TASKS_SHOWN);
          const extra = dayTasks.length - MAX_TASKS_SHOWN;
          return (
            <div key={dateStr} className={`calendar__cell${isToday ? " calendar__cell--today" : ""}${isPast && !isToday ? " calendar__cell--past" : ""}`}>
              <div className="calendar__day">
                <span>{day}</span>
                {dayTasks.length > 0 && !isToday && (
                  <span className="calendar__day-dot" style={{ background: dayTasks.some(t => !t.done) ? PRIORITY_COLORS[dayTasks[0].priority] : "var(--color-success)" }} />
                )}
              </div>
              <div className="calendar__tasks">
                {shown.map(t => (
                  <div
                    key={t.id}
                    className={`calendar__task${t.done ? " calendar__task--done" : ""}`}
                    style={{ borderLeftColor: PRIORITY_COLORS[t.priority], background: PRIORITY_BACKGROUNDS[t.priority] }}
                    onClick={() => onEdit(t)}
                    title={t.title}
                  >
                    <span className="calendar__task-title">{t.title}</span>
                  </div>
                ))}
                {extra > 0 && <div className="calendar__overflow">+{extra} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
