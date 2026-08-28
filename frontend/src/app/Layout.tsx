import { NavLink, Outlet } from 'react-router-dom';
import { PonyBadge } from '../shared/components/PonyBadge';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/vehicles', label: 'Vehicles', end: false },
  { to: '/customers', label: 'Customers', end: false },
  { to: '/bookings', label: 'Bookings', end: false },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-brand">
            <PonyBadge />
            Bruno Vehicle Hire
          </span>
          <nav className="app-nav">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `app-nav-link${isActive ? ' app-nav-link-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
