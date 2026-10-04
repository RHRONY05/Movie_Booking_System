import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, X, Film, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CineLogo } from './CineLogo';
import './Navbar.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="var(--google-blue, #4285F4)"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="var(--google-green, #34A853)"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="var(--google-yellow, #FBBC05)"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="var(--google-red, #EA4335)"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Navbar = ({ onNavigate, currentTab = 'movies' }) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  // Close mobile drawer when clicking outside the navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile drawer automatically if viewport expands past tablet breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleNavigate = (tab) => {
    if (onNavigate) {
      onNavigate(tab);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header ref={headerRef} className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavigate('movies')}
          className="navbar-brand"
          title="Return to Home"
        >
          <CineLogo withText={true} size={34} />
        </div>

        {/* Desktop Center Navigation Links */}
        <nav className="navbar-desktop-nav" aria-label="Main Navigation">
          <button
            onClick={() => handleNavigate('movies')}
            className={`navbar-nav-link ${currentTab === 'movies' ? 'active' : ''}`}
          >
            Now Showing
            {currentTab === 'movies' && <span className="navbar-nav-indicator" />}
          </button>

          {isAuthenticated && (
            <button
              onClick={() => handleNavigate('profile')}
              className={`navbar-nav-link ${currentTab === 'profile' ? 'active' : ''}`}
            >
              My Bookings
              {currentTab === 'profile' && <span className="navbar-nav-indicator" />}
            </button>
          )}
        </nav>

        {/* Desktop Auth Profile Section */}
        <div className="navbar-desktop-auth">
          {isAuthenticated ? (
            <div className="navbar-user-wrapper">
              <button
                onClick={() => handleNavigate('profile')}
                className={`navbar-user-pill ${currentTab === 'profile' ? 'active' : ''}`}
                title="View Profile & Bookings"
              >
                <div className="navbar-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="navbar-user-name">
                  {user?.name || user?.email}
                </span>
              </button>

              <button
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
                className="navbar-logout-btn"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="navbar-google-btn"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          )}
        </div>

        {/* Mobile Header Actions (Visible on screens <= 768px) */}
        <div className="navbar-mobile-actions">
          {isAuthenticated ? (
            <button
              onClick={() => handleNavigate('profile')}
              className="navbar-avatar-circle navbar-mobile-avatar-btn"
              title="View Profile"
              aria-label="View Profile"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="navbar-mobile-signin-btn"
              title="Sign In"
              aria-label="Sign In"
            >
              <GoogleIcon />
              <span>Sign In</span>
            </button>
          )}

          {/* Hamburger / Close Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`navbar-hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-drawer" role="dialog" aria-modal="false" aria-label="Mobile Navigation Menu">
          <div className="navbar-mobile-drawer-content">
            {/* Navigation Links */}
            <div className="navbar-mobile-links">
              <button
                onClick={() => handleNavigate('movies')}
                className={`navbar-mobile-link ${currentTab === 'movies' ? 'active' : ''}`}
              >
                <div className="navbar-mobile-link-left">
                  <Film size={18} />
                  <span>Now Showing</span>
                </div>
                {currentTab === 'movies' && <span className="navbar-mobile-active-badge">Active</span>}
              </button>

              <button
                onClick={() => handleNavigate('profile')}
                className={`navbar-mobile-link ${currentTab === 'profile' ? 'active' : ''}`}
              >
                <div className="navbar-mobile-link-left">
                  <Ticket size={18} />
                  <span>My Bookings & Tickets</span>
                </div>
                {currentTab === 'profile' && <span className="navbar-mobile-active-badge">Active</span>}
              </button>
            </div>

            <div className="navbar-mobile-divider" />

            {/* Mobile Auth & Profile Card */}
            <div className="navbar-mobile-auth">
              {isAuthenticated ? (
                <div className="navbar-mobile-user-card">
                  <div className="navbar-mobile-user-info">
                    <div className="navbar-avatar-circle">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="navbar-mobile-user-details">
                      <span className="navbar-mobile-user-name">
                        {user?.name || 'Cinephile User'}
                      </span>
                      <span className="navbar-mobile-user-email">
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="navbar-mobile-logout-btn"
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="navbar-google-btn navbar-mobile-google-btn"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
