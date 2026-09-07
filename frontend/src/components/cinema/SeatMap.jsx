import React from 'react';
import { Armchair, Sparkles } from 'lucide-react';

export const SeatMap = ({ seats = [], selectedSeat, onSeatClick }) => {
  // Group seats by row (e.g., 'A', 'B', 'C', 'D', 'E', 'F')
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getSeatData = (row, col) => {
    const seatNumber = `${row}${col}`;
    return seats.find((s) => s.seat_number === seatNumber) || {
      id: `seat-${seatNumber}`,
      seat_number: seatNumber,
      status: 'AVAILABLE',
    };
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        padding: 'var(--space-xl)',
        backgroundColor: 'var(--bg-surface-glass)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      {/* Seating Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm)',
          alignItems: 'center',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        {rows.map((row) => (
          <div
            key={row}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
            }}
          >
            {/* Row Letter Label */}
            <span
              style={{
                width: '24px',
                textAlign: 'center',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-muted)',
              }}
            >
              {row}
            </span>

            {/* Left Block (Seats 1-5) */}
            <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
              {cols.slice(0, 5).map((col) => {
                const seat = getSeatData(row, col);
                const isSelected = selectedSeat?.id === seat.id;
                return renderSeatButton(seat, isSelected, onSeatClick);
              })}
            </div>

            {/* Aisle Spacer */}
            <div style={{ width: 'var(--space-lg)' }} />

            {/* Right Block (Seats 6-10) */}
            <div style={{ display: 'flex', gap: 'var(--space-2xs)' }}>
              {cols.slice(5, 10).map((col) => {
                const seat = getSeatData(row, col);
                const isSelected = selectedSeat?.id === seat.id;
                return renderSeatButton(seat, isSelected, onSeatClick);
              })}
            </div>

            {/* Row Letter Label (Right side) */}
            <span
              style={{
                width: '24px',
                textAlign: 'center',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-muted)',
              }}
            >
              {row}
            </span>
          </div>
        ))}
      </div>

      {/* Screen Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-xl)',
          paddingTop: 'var(--space-lg)',
          borderTop: 'var(--glass-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--text-secondary)',
              backgroundColor: 'var(--bg-surface-elevated)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            Available
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              boxShadow: 'var(--shadow-glow-red)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', fontWeight: 'var(--font-weight-bold)' }}>
            Selected
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--state-reserved)',
              boxShadow: '0 0 10px var(--state-reserved-glow)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            Reserved (Pending OTP)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--state-booked)',
            }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Booked (Occupied)
          </span>
        </div>
      </div>
    </div>
  );
};

function renderSeatButton(seat, isSelected, onSeatClick) {
  const isBooked = seat.status === 'BOOKED';
  const isReserved = seat.status === 'RESERVED';
  const isAvailable = !isBooked && !isReserved;

  let bg = 'var(--bg-surface-elevated)';
  let border = 'var(--glass-border)';
  let color = 'var(--text-secondary)';
  let shadow = 'none';
  let cursor = 'pointer';

  if (isSelected) {
    bg = 'var(--accent-primary)';
    border = '1px solid var(--accent-primary)';
    color = 'var(--text-primary)';
    shadow = 'var(--shadow-glow-red)';
  } else if (isReserved) {
    bg = 'var(--state-reserved)';
    border = '1px solid var(--state-reserved)';
    color = 'var(--text-inverse)';
    shadow = '0 0 10px var(--state-reserved-glow)';
    cursor = 'not-allowed';
  } else if (isBooked) {
    bg = 'var(--state-booked)';
    border = '1px solid transparent';
    color = 'var(--text-muted)';
    cursor = 'not-allowed';
  }

  return (
    <button
      key={seat.id || seat.seat_number}
      disabled={!isAvailable && !isSelected}
      onClick={() => onSeatClick && onSeatClick(seat)}
      aria-label={`Seat ${seat.seat_number} - ${seat.status}`}
      title={`Seat ${seat.seat_number} (${seat.status})`}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: bg,
        border,
        color,
        boxShadow: shadow,
        cursor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-bold)',
        transition: 'var(--transition-fast)',
        position: 'relative',
      }}
    >
      <span>{seat.seat_number}</span>
    </button>
  );
}

export default SeatMap;
