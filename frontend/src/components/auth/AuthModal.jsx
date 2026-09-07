import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { Film, ShieldCheck, Loader2 } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setErrorMsg('');

      if (!credentialResponse?.credential) {
        throw new Error('No credential returned from Google.');
      }

      // Send real Google ID token directly to POST /api/auth/google
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('Google Sign-In popup was closed or cancelled.');
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} title="">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        {/* Brand Icon Header */}
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto var(--space-md) auto',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            boxShadow: 'var(--shadow-glow-red)',
          }}
        >
          <Film size={28} />
        </div>

        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-xs)',
          }}
        >
          Sign in to <span style={{ color: 'var(--accent-primary)' }}>CineReserve</span>
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.4,
          }}
        >
          Unlock real-time seat reservation, instant OTP verification, and digital movie passes.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            backgroundColor: 'var(--bg-state-error)',
            border: '1px solid var(--state-error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--state-error)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-lg)',
            textAlign: 'center',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Official Google OAuth Sign-In Component */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          minHeight: '44px',
          marginBottom: 'var(--space-md)',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span>Verifying with Google...</span>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="pill"
            size="large"
            width="320"
          />
        )}
      </div>

      {/* Trust & Security Footer */}
      <div
        style={{
          marginTop: 'var(--space-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-xs)',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)',
          borderTop: 'var(--glass-border)',
          paddingTop: 'var(--space-md)',
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--state-available)' }} />
        <span>Official Google OAuth 2.0 • 256-bit Encrypted Session</span>
      </div>
    </Modal>
  );
};

export default AuthModal;
