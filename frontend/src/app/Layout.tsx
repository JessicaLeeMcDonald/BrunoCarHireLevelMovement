import { NavLink, Outlet } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/customers', label: 'Customers' },
  { to: '/bookings', label: 'Bookings' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-brand">Bruno Vehicle Hire</span>
          <nav className="app-nav">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
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
