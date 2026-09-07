import React from 'react';
import { Ticket, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const CheckoutDrawer = ({ movie, selectedSeat, onProceed, loading }) => {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 'var(--space-md)',
        maxWidth: '820px',
        width: '100%',
        margin: 'var(--space-xl) auto 0 auto',
        backgroundColor: 'var(--bg-surface-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-elevated)',
        padding: 'var(--space-md) var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-md)',
        zIndex: 50,
      }}
    >
      {/* Left Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
          }}
        >
          <Ticket size={22} />
        </div>

        <div>
          <h4
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {movie?.title || 'Selected Movie'}
          </h4>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            {selectedSeat ? (
              <>
                Selected Seat: <span style={{ color: 'var(--accent-secondary)', fontWeight: 'var(--font-weight-bold)' }}>{selectedSeat.seat_number}</span> • IMAX Hall 1
              </>
            ) : (
              'Click an available seat above to select'
            )}
          </p>
        </div>
      </div>

      {/* Right Price & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Total Price
          </span>
          <div
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-black)',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            {selectedSeat ? '$15.00' : '$0.00'}
          </div>
        </div>

        <button
          onClick={onProceed}
          disabled={!selectedSeat || loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            padding: 'var(--space-md) var(--space-xl)',
            backgroundColor: selectedSeat ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
            color: selectedSeat ? 'var(--text-primary)' : 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-bold)',
            boxShadow: selectedSeat ? 'var(--shadow-glow-red)' : 'none',
            cursor: selectedSeat && !loading ? 'pointer' : 'not-allowed',
            transition: 'var(--transition-fast)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Reserving...</span>
            </>
          ) : (
            <>
              <span>Proceed to Verify</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutDrawer;
