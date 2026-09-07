import React from 'react';
import { Film, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-glow-red)',
            }}
          >
            <Film size={20} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-black)',
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
              }}
            >
              CINE<span style={{ color: 'var(--accent-primary)' }}>RESERVE</span>
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', gap: 'var(--space-xl)' }}>
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
                  boxShadow: 'var(--shadow-glow-red)',
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
                  boxShadow: currentTab === 'profile' ? 'var(--shadow-glow-red)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--text-primary)',
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
                gap: 'var(--space-sm)',
                padding: 'var(--space-xs) var(--space-lg)',
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                boxShadow: 'var(--shadow-glow-red)',
                transition: 'var(--transition-fast)',
              }}
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
