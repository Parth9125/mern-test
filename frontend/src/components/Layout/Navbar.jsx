import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_ITEMS, APP_NAME } from '../../utils/constants';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          {APP_NAME}
        </Link>

        <ul className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={isActiveRoute(item.path) ? 'active' : ''}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-user">
          <div className="d-flex align-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-sm">
              {user?.name || user?.email || 'Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-logout d-flex align-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;