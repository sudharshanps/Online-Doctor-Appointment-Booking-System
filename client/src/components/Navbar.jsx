import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Clock,
  ShieldCheck,
  Search
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isDoctor, isPatient } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="logo-icon-box">
            <Activity size={24} className="logo-icon" />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">MediLink</span>
            <span className="brand-tagline">Innovations</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/doctors"
            className={`nav-link ${isActive('/doctors') ? 'active' : ''}`}
          >
            <Search size={16} />
            Find Doctors
          </Link>

          {isAuthenticated && isPatient && (
            <>
              <Link
                to="/patient/dashboard"
                className={`nav-link ${isActive('/patient/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/patient/appointments"
                className={`nav-link ${isActive('/patient/appointments') ? 'active' : ''}`}
              >
                <Calendar size={16} />
                My Appointments
              </Link>
            </>
          )}

          {isAuthenticated && isDoctor && (
            <>
              <Link
                to="/doctor/dashboard"
                className={`nav-link ${isActive('/doctor/dashboard') ? 'active' : ''}`}
              >
                <Stethoscope size={16} />
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor/schedule"
                className={`nav-link ${isActive('/doctor/schedule') ? 'active' : ''}`}
              >
                <Clock size={16} />
                Manage Schedule
              </Link>
            </>
          )}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="desktop-auth-actions">
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <Link
                to="/profile"
                className="user-info-pill"
                title="View / Edit Profile"
              >
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <div className="user-text">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role-tag">
                    {user?.role === 'doctor' ? 'Doctor' : 'Patient'}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm logout-btn"
                title="Sign out securely"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="guest-action-group">
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register as Patient
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-links">
            <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/doctors" className="mobile-nav-link" onClick={closeMenu}>
              Find Doctors
            </Link>

            {isAuthenticated && isPatient && (
              <>
                <Link
                  to="/patient/dashboard"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  Patient Dashboard
                </Link>
                <Link
                  to="/patient/appointments"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  My Appointments
                </Link>
              </>
            )}

            {isAuthenticated && isDoctor && (
              <>
                <Link
                  to="/doctor/dashboard"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  Doctor Dashboard
                </Link>
                <Link
                  to="/doctor/schedule"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  Manage Schedule
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="mobile-user-section">
                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={closeMenu}
                >
                  <User size={16} />
                  Profile ({user?.name} — {user?.role})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-block mt-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-guest-section">
                <Link
                  to="/login"
                  className="btn btn-outline btn-block mb-2"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-block"
                  onClick={closeMenu}
                >
                  Register as Patient
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
