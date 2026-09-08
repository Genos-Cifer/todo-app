import { useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import "./ProfileMenu.css";

function initialsFor(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
}

export function ProfileMenu({ username, email, avatarUrl, onSignOut, onOpenNotifications, notificationsActive }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  useClickOutside(menuRef, () => setOpen(false));

  const avatar = (extraClass = "") =>
    avatarUrl ? (
      <img className={`profile-menu__avatar ${extraClass}`} src={avatarUrl} alt="" />
    ) : (
      <span className={`profile-menu__avatar profile-menu__avatar--initials ${extraClass}`}>{initialsFor(username)}</span>
    );

  return (
    <div className="profile-menu" ref={menuRef}>
      <button className="profile-menu__trigger" onClick={() => setOpen(o => !o)} title={username} aria-haspopup="true" aria-expanded={open}>
        {avatar()}
      </button>

      {open && (
        <div className="profile-menu__panel" role="menu">
          <div className="profile-menu__header">
            {avatar("profile-menu__avatar--lg")}
            <div className="profile-menu__identity">
              <div className="profile-menu__name">{username}</div>
              {email && <div className="profile-menu__email">{email}</div>}
            </div>
          </div>

          <div className="profile-menu__divider" />

          <button
            className="profile-menu__action"
            onClick={() => { setOpen(false); onOpenNotifications(); }}
          >
            <span>🔔</span>
            <span className="profile-menu__action-label">Notifications</span>
            <span className={`profile-menu__status${notificationsActive ? " profile-menu__status--on" : ""}`}>
              {notificationsActive ? "On" : "Off"}
            </span>
          </button>

          <div className="profile-menu__divider" />

          <button className="profile-menu__logout" onClick={onSignOut}>
            <span>↪</span> Log out
          </button>
        </div>
      )}
    </div>
  );
}
