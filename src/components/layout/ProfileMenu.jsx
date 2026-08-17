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

export function ProfileMenu({ username, email, avatarUrl, onSignOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  useClickOutside(menuRef, () => setOpen(false));

  return (
    <div className="profile-menu" ref={menuRef}>
      <button className="profile-menu__trigger" onClick={() => setOpen(o => !o)} title={username} aria-haspopup="true" aria-expanded={open}>
        {avatarUrl ? <img className="profile-menu__avatar" src={avatarUrl} alt="" /> : <span className="profile-menu__avatar profile-menu__avatar--initials">{initialsFor(username)}</span>}
      </button>

      {open && (
        <div className="profile-menu__panel" role="menu">
          <div className="profile-menu__header">
            {avatarUrl ? <img className="profile-menu__avatar profile-menu__avatar--lg" src={avatarUrl} alt="" /> : <span className="profile-menu__avatar profile-menu__avatar--lg profile-menu__avatar--initials">{initialsFor(username)}</span>}
            <div className="profile-menu__identity">
              <div className="profile-menu__name">{username}</div>
              {email && <div className="profile-menu__email">{email}</div>}
            </div>
          </div>
          <div className="profile-menu__divider" />
          <button className="profile-menu__logout" onClick={onSignOut}>
            <span>↪</span> Log out
          </button>
        </div>
      )}
    </div>
  );
}
