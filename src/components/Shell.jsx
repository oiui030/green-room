import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import Icon from './Icon.jsx';
import FrogSheet from './FrogSheet.jsx';
import Frog from './Frog.jsx';

const TABS = [
  { to: '/home', label: '내 방', icon: 'room' },
  { to: '/care', label: '돌봄', icon: 'calendar' },
  { to: '/discover', label: '도감', icon: 'book' },
  { to: '/log', label: '기록', icon: 'list' },
];

export { Frog };

export function Nav() {
  return (
    <nav className="nav" aria-label="주 메뉴">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => `nav-item${isActive ? ' on' : ''}`}>
          {({ isActive }) => (
            <>
              <span className="nav-ic"><Icon name={t.icon} size={22} width={2.2} /></span>
              <span>{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// Page frame. `tabs` shows the bottom menu, `frog` shows the floating helper.
export function Page({ children, tabs = false, frog = true, plantId = null, className = '', deco = null }) {
  const [open, setOpen] = useState(false);
  const { toast, undo } = useStore();
  const { pathname } = useLocation();
  // A new screen starts at its top, whatever the scroll position of the one before.
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className={`page ${tabs ? 'with-tabs' : ''} ${className}`}>
      {deco}
      <main className="page-body">{children}</main>
      {frog && (
        <div className={`fab-wrap ${tabs ? 'above-tabs' : ''}`}>
          <button type="button" className="fab" aria-label="개구리에게 도움 요청" onClick={() => setOpen(true)}>
            <Frog size={72} ring={6} tone="lime" />
          </button>
        </div>
      )}
      {toast && (
        <div className={`toast ${tabs ? 'above-tabs' : ''}`} role="status">
          <span className="grow">{toast.message}</span>
          <button type="button" className="toast-undo" onClick={undo}>되돌리기</button>
        </div>
      )}
      {tabs && <Nav />}
      {open && <FrogSheet plantId={plantId} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function BackLink({ to, label }) {
  const navigate = useNavigate();
  if (to) {
    return (
      <Link className="back" to={to}>
        <Icon name="back" size={20} width={2} />
        {label}
      </Link>
    );
  }
  return (
    <button type="button" className="back" onClick={() => navigate(-1)}>
      <Icon name="back" size={20} width={2} />
      {label}
    </button>
  );
}
