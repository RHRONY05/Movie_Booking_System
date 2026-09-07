import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title = '') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg, title = 'Success') => addToast('success', msg, title),
    error: (msg, title = 'Error') => addToast('error', msg, title),
    info: (msg, title = 'Notice') => addToast('info', msg, title),
    warning: (msg, title = 'Warning') => addToast('warning', msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Glassmorphic Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: 'var(--space-xl)',
          right: 'var(--space-xl)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
          maxWidth: '380px',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: 'var(--bg-surface-glass)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: getBorderForType(item.type),
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              boxShadow: 'var(--shadow-elevated)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-sm)',
              animation: 'toast-slide-in var(--transition-normal)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left Status Icon */}
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {getIconForType(item.type)}
            </div>

            {/* Message Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {item.title && (
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                  }}
                >
                  {item.title}
                </div>
              )}
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {item.message}
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(item.id)}
              aria-label="Dismiss notification"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                padding: '2px',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)',
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

function getIconForType(type) {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={18} style={{ color: 'var(--state-available)' }} />;
    case 'error':
      return <AlertCircle size={18} style={{ color: 'var(--state-error)' }} />;
    case 'warning':
      return <AlertTriangle size={18} style={{ color: 'var(--state-reserved)' }} />;
    case 'info':
    default:
      return <Info size={18} style={{ color: 'var(--accent-secondary)' }} />;
  }
}

function getBorderForType(type) {
  switch (type) {
    case 'success':
      return '1px solid rgba(34, 197, 94, 0.4)';
    case 'error':
      return '1px solid rgba(239, 68, 68, 0.4)';
    case 'warning':
      return '1px solid rgba(245, 158, 11, 0.4)';
    case 'info':
    default:
      return '1px solid rgba(0, 240, 255, 0.3)';
  }
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
