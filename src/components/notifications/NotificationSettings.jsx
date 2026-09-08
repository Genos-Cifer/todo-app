import { showTestNotification } from "../../utils/notifications";
import "../../styles/shared.css";
import "./NotificationSettings.css";

function formatHour(hour) {
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:00 ${suffix}`;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export function NotificationSettings({ supported, permission, settings, active, onEnable, onDisable, onDigestHourChange, onClose }) {
  return (
    <div className="modal modal--narrow" role="dialog" aria-modal="true">
      <div className="modal-header">
        <h2>🔔 Notifications</h2>
        <button className="icon-btn icon-btn--ghost" style={{ fontSize: 16 }} onClick={onClose}>✕</button>
      </div>

      <div className="modal-body">
        <p className="notif__intro">TaskFlow can remind you about your tasks two ways:</p>
        <ul className="notif__list">
          <li><strong>A daily digest</strong> — one summary of everything due today.</li>
          <li><strong>Overdue alerts</strong> — a one-off nudge when a task's due date passes.</li>
        </ul>

        {!supported && (
          <div className="notif__banner notif__banner--warn">
            This browser doesn't support notifications.
          </div>
        )}

        {supported && permission === "denied" && (
          <div className="notif__banner notif__banner--warn">
            Notifications are blocked for this site. Re-allow them in your browser's site settings (the icon in the
            address bar), then reopen this panel.
          </div>
        )}

        {supported && permission !== "denied" && (
          <>
            <div className="notif__row">
              <div>
                <div className="notif__row-title">{active ? "Notifications are on" : "Notifications are off"}</div>
                <div className="notif__row-sub">
                  {active ? "You'll get a digest and overdue alerts." : "Turn them on to start getting reminders."}
                </div>
              </div>
              {active ? (
                <button className="btn-secondary" onClick={onDisable}>Turn off</button>
              ) : (
                <button className="btn-primary" onClick={onEnable}>Turn on</button>
              )}
            </div>

            {active && (
              <>
                <div className="field" style={{ marginTop: 18 }}>
                  <label className="field-label">Daily digest time</label>
                  <select value={settings.digestHour} onChange={e => onDigestHourChange(Number(e.target.value))}>
                    {HOURS.map(hour => (
                      <option key={hour} value={hour}>{formatHour(hour)}</option>
                    ))}
                  </select>
                </div>
                <button className="notif__test" onClick={showTestNotification}>Send a test notification</button>
              </>
            )}
          </>
        )}

        <div className="notif__note">
          <strong>Heads up:</strong> browser notifications only fire while TaskFlow is open in a tab. If the digest hour
          passes while the app is closed, you'll get that day's digest the next time you open it.
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
