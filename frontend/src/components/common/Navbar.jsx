import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CineLogo } from './CineLogo';

export const Navbar = ({ onNavigate, currentTab = 'movies' }) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-surface-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: 'var(--glass-border)',
        padding: 'var(--space-md) var(--space-xl)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate && onNavigate('movies')}
          style={{
            cursor: 'pointer',
          }}
        >
          <CineLogo withText={true} size={36} />
        </div>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
          <button
            onClick={() => onNavigate && onNavigate('movies')}
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: currentTab === 'movies' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
              color: currentTab === 'movies' ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'var(--transition-fast)',
              position: 'relative',
              padding: 'var(--space-xs) 0',
              cursor: 'pointer',
            }}
          >
            Now Showing
            {currentTab === 'movies' && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-glow-amethyst)',
                }}
              />
            )}
          </button>

        </nav>

        {/* Auth Profile Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {/* User Profile Pill - Clickable to open Profile */}
              <div
                onClick={() => onNavigate && onNavigate('profile')}
                title="View Profile & Bookings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  backgroundColor: currentTab === 'profile' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  border: currentTab === 'profile' ? '1px solid var(--accent-primary)' : 'var(--glass-border)',
                  padding: 'var(--space-xs) var(--space-md)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  boxShadow: currentTab === 'profile' ? 'var(--shadow-glow-amethyst)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--btn-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: currentTab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {user?.name || user?.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-surface)',
                  border: 'var(--glass-border)',
                  color: 'var(--text-muted)',
                  transition: 'var(--transition-fast)',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 18px',
                backgroundColor: '#ffffff',
                color: '#1f1f1f',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-family-body)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f1f1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
