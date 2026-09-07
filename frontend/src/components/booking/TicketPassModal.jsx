import React from 'react';
import { Modal } from '../ui/Modal';
import { CheckCircle2, QrCode } from 'lucide-react';

export const TicketPassModal = ({ isOpen, onClose, ticketData }) => {
  if (!ticketData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="440px">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
        {/* Success Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            margin: '0 auto var(--space-xs) auto',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '2px solid var(--state-available)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--state-available)',
            boxShadow: 'var(--shadow-glow-green)',
          }}
        >
          <CheckCircle2 size={28} />
        </div>

        <h2
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-black)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-3xs)',
          }}
        >
          Booking <span style={{ color: 'var(--state-available)' }}>Confirmed!</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
          Your digital ticket pass has been minted and secured.
        </p>
      </div>

      {/* Digital Boarding Pass Ticket Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-canvas)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: 'var(--space-md)',
          position: 'relative',
        }}
      >
        {/* Pass Top Banner */}
        <div
          style={{
            backgroundColor: 'var(--accent-primary)',
            padding: 'var(--space-2xs) var(--space-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontWeight: 'var(--font-weight-black)',
            letterSpacing: '0.08em',
          }}
        >
          <span>CINERESERVE IMAX PASS</span>
          <span>HALL 01</span>
        </div>

        {/* Pass Content Details */}
        <div style={{ padding: 'var(--space-md)' }}>
          <h3
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            {ticketData.movieTitle || 'Neon Ascension'}
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-sm) var(--space-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: 'var(--glass-border)',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SEAT</span>
              <div
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-black)',
                  color: 'var(--accent-secondary)',
                  lineHeight: 1.2,
                }}
              >
                {ticketData.seatNumber || 'D5'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SHOWTIME</span>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                7:00 PM
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</span>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--state-available)',
                  lineHeight: 1.2,
                }}
              >
                CONFIRMED
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRICE</span>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                }}
              >
                $15.00
              </div>
            </div>
          </div>

          {/* QR Code Barcode Area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-sm)',
              backgroundColor: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-inverse)',
            }}
          >
            <QrCode size={72} />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 'bold',
                marginTop: 'var(--space-3xs)',
                letterSpacing: '0.1em',
              }}
            >
              CR-IMAX-{ticketData.bookingId?.slice(0, 8) || 'CONFIRMED'}
            </span>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: 'var(--space-sm) var(--space-md)',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-bold)',
          transition: 'var(--transition-fast)',
          cursor: 'pointer',
        }}
      >
        Done & View More Movies
      </button>
    </Modal>
  );
};

export default TicketPassModal;

