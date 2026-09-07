import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { KeyRound, ShieldCheck, Clock, Loader2, ArrowRight } from 'lucide-react';

export const OtpModal = ({ isOpen, onClose, onVerify, bookingData, loading }) => {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef([]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  // Reset digits and initialize timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMsg('');

      let remainingSec = 600; // default 10 minutes (600s)
      if (bookingData?.expires_at) {
        const remainingMs = new Date(bookingData.expires_at).getTime() - Date.now();
        remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      }
      setTimer(remainingSec);

      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen, bookingData]);

  const handleChange = (index, value) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Take last character
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }
    
    if (timer <= 0) {
      setErrorMsg('The verification code has expired. Please reserve your seat again.');
      return;
    }

    try {
      setErrorMsg('');
      await onVerify(fullOtp);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="500px">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
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
            color: 'var(--accent-secondary)',
            boxShadow: 'var(--shadow-glow-cyan)',
          }}
        >
          <KeyRound size={28} />
        </div>

        <h2
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-xs)',
          }}
        >
          Verify Your <span style={{ color: 'var(--accent-primary)' }}>Booking</span>
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            maxWidth: '380px',
            margin: '0 auto',
            lineHeight: 1.4,
          }}
        >
          A 6-digit verification code has been dispatched to{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {bookingData?.email || 'your email'}
          </strong>
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

      {/* 6 Digit Input Boxes */}
      <div
        onPaste={handlePaste}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-xs)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {otpDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e.target)}
            style={{
              width: '52px',
              height: '60px',
              textAlign: 'center',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-black)',
              backgroundColor: 'var(--bg-canvas)',
              border: digit ? '2px solid var(--accent-primary)' : 'var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              boxShadow: digit ? 'var(--shadow-glow-red)' : 'none',
              outline: 'none',
              transition: 'var(--transition-fast)',
            }}
          />
        ))}
      </div>

      {/* Resend Timer Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2xs)',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <Clock size={14} style={{ color: 'var(--accent-secondary)' }} />
        <span>
          {timer > 0 ? (
            <>
              Code expires in{' '}
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {formattedTime}
              </strong>
            </>
          ) : (
            <span style={{ color: 'var(--state-error)', fontWeight: 'var(--font-weight-semibold)' }}>
              OTP Expired. Reservation cancelled.
            </span>
          )}
        </span>
      </div>

      {/* Primary Verification Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || otpDigits.join('').length < 6}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-md) var(--space-xl)',
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-bold)',
          boxShadow: 'var(--shadow-glow-red)',
          cursor: otpDigits.join('').length === 6 && !loading ? 'pointer' : 'not-allowed',
          opacity: otpDigits.join('').length === 6 ? 1 : 0.6,
          transition: 'var(--transition-fast)',
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Confirming Booking...</span>
          </>
        ) : (
          <>
            <span>Confirm & Issue Ticket</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* Lock Footer */}
      <div
        style={{
          marginTop: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-xs)',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-size-xs)',
        }}
      >
        <ShieldCheck size={14} style={{ color: 'var(--state-available)' }} />
        <span>Pessimistic DB Lock Active • 100% Reserved</span>
      </div>
    </Modal>
  );
};

export default OtpModal;
