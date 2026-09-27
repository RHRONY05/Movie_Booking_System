import React, { useState } from 'react';
import { Film, Star, Award, Ticket, ArrowRight, Layers, MapPin, CheckCircle2 } from 'lucide-react';

export const LivePreviewSection = ({ roles, fonts, paletteName, isShuffled }) => {
  const [btnHovered, setBtnHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [sampleSeatStatus, setSampleSeatStatus] = useState({
    A1: 'available',
    A2: 'available',
    A3: 'selected',
    A4: 'selected',
    A5: 'reserved',
    A6: 'booked',
  });

  const handleSeatClick = (seatId) => {
    setSampleSeatStatus(prev => {
      const cur = prev[seatId];
      let next = 'available';
      if (cur === 'available') next = 'selected';
      else if (cur === 'selected') next = 'reserved';
      else if (cur === 'reserved') next = 'booked';
      else next = 'available';
      return { ...prev, [seatId]: next };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* 1. Hero Spotlight Banner */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: roles.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={18} color={roles.accentPrimary} />
            <span>1. Hero Spotlight Banner (Surfaces & Button Test)</span>
          </h3>
          <span style={{ fontSize: '12px', color: roles.textSecondary }}>
            Canvas: <code style={{ color: roles.accentPrimary }}>{roles.bgCanvas}</code> • Button: <code style={{ color: roles.accentPrimary }}>{roles.btnPrimary}</code>
          </span>
        </div>

        <div style={{
          backgroundColor: roles.bgSurface,
          border: `1px solid ${roles.borderSubtle}`,
          borderRadius: '12px',
          padding: '44px 36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          background: `linear-gradient(135deg, ${roles.bgCard} 0%, ${roles.bgSurface} 60%, ${roles.bgCanvas} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              backgroundColor: `${roles.accentPrimary}22`,
              color: roles.accentPrimary,
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '14px',
              border: `1px solid ${roles.accentPrimary}44`
            }}>
              <Award size={13} />
              <span>OFFICIAL SELECTION • 77TH CANNES FILM FESTIVAL</span>
            </div>

            <h1 style={{
              fontFamily: fonts.fontDisplay,
              fontSize: fonts.id === 'bebas' ? '46px' : '34px',
              lineHeight: 1.15,
              color: roles.textPrimary,
              marginBottom: '12px'
            }}>
              ANATOMY OF A SHADOW
            </h1>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              color: roles.textSecondary,
              fontSize: '13px',
              marginBottom: '14px'
            }}>
              <span style={{ color: roles.accentPrimary, fontWeight: 700 }}>Directed by Claude Moreau</span>
              <span>•</span>
              <span>2h 18m</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} color={roles.accentPrimary} fill={roles.accentPrimary} />
                <strong style={{ color: roles.textPrimary }}>98% Rotten Tomatoes</strong>
              </span>
              <span>•</span>
              <span style={{
                backgroundColor: roles.bgCard,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                color: roles.accentSecondary,
                border: `1px solid ${roles.borderSubtle}`
              }}>
                35mm Archival Print
              </span>
            </div>

            <p style={{
              color: roles.textSecondary,
              fontSize: '14px',
              lineHeight: 1.6,
              marginBottom: '26px'
            }}>
              On the rain-slicked boulevards of post-war Paris, an estranged forensic cartographer discovers a forged blueprint detailing a high-stakes crime that has not yet occurred.
            </p>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <button
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  padding: '12px 26px',
                  borderRadius: '8px',
                  backgroundColor: btnHovered ? roles.btnHover : roles.btnPrimary,
                  color: roles.btnText,
                  fontFamily: fonts.fontBody,
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: `0 4px 20px ${roles.btnPrimary}44`,
                  transition: 'background-color 0.15s ease, transform 0.15s ease',
                  transform: btnHovered ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <Ticket size={16} />
                <span>Reserve Seats</span>
                <ArrowRight size={15} />
              </button>

              <button style={{
                padding: '12px 20px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: roles.textPrimary,
                fontFamily: fonts.fontBody,
                fontSize: '14px',
                fontWeight: 600,
                border: `1px solid ${roles.borderSubtle}`,
                cursor: 'pointer'
              }}>
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Movie Catalog Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: roles.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color={roles.accentPrimary} />
            <span>2. Movie Cards & Metadata (Hover to Test Card Hover Color)</span>
          </h3>
          <span style={{ fontSize: '12px', color: roles.textSecondary }}>
            Card Base: <code style={{ color: roles.accentPrimary }}>{roles.bgCard}</code> • Card Hover: <code style={{ color: roles.accentPrimary }}>{roles.bgCardHover}</code>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {[
            {
              id: 'm1',
              title: 'ANATOMY OF A SHADOW',
              badge: 'NOW SHOWING',
              badgeColor: roles.accentPrimary,
              genre: 'Psychological Neo-Noir • 2h 18m',
              score: '9.8',
              time: 'Today • 8:15 PM'
            },
            {
              id: 'm2',
              title: 'THE GRAND HORIZON',
              badge: 'IMAX 70MM',
              badgeColor: roles.accentSecondary,
              genre: 'Epic Sci-Fi Odyssey • 2h 42m',
              score: '9.1',
              time: 'Tonight • 9:30 PM'
            },
            {
              id: 'm3',
              title: 'AUTUMN IN VERONA',
              badge: 'FESTIVAL PREMIERE',
              badgeColor: roles.accentPrimary,
              genre: 'Atmospheric Drama • 1h 54m',
              score: '8.9',
              time: 'Tomorrow • 7:00 PM'
            }
          ].map(card => {
            const isCardActive = hoveredCard === card.id;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: isCardActive ? roles.bgCardHover : roles.bgCard,
                  border: isCardActive ? `1px solid ${roles.borderFocus}` : `1px solid ${roles.borderSubtle}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isCardActive ? `0 12px 30px rgba(0, 0, 0, 0.5)` : '0 6px 18px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease',
                  transform: isCardActive ? 'translateY(-3px)' : 'none'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: roles.bgSurface,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '14px',
                  background: `linear-gradient(180deg, transparent 30%, ${roles.bgCard} 100%), radial-gradient(circle at top right, ${card.badgeColor}22 0%, transparent 70%)`
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: roles.bgSurface,
                    border: `1px solid ${roles.borderSubtle}`,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: card.badgeColor
                  }}>
                    {card.badge}
                  </div>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontFamily: fonts.fontDisplay, fontSize: fonts.id === 'bebas' ? '20px' : '17px', color: roles.textPrimary, margin: 0 }}>
                      {card.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: roles.accentPrimary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={12} fill={roles.accentPrimary} />
                      {card.score}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: roles.textSecondary, marginBottom: '14px', margin: '4px 0 14px 0' }}>
                    {card.genre}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: `1px solid ${roles.borderSubtle}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: roles.accentSecondary }}>{card.time}</span>
                    <button style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: `${roles.accentPrimary}18`,
                      border: `1px solid ${roles.accentPrimary}55`,
                      color: roles.accentPrimary,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                      Select Seats
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Auditorium Seat Map Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: roles.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color={roles.accentPrimary} />
            <span>3. Auditorium Curved Screen & Seat States</span>
          </h3>
          <span style={{ fontSize: '12px', color: roles.textSecondary }}>Click seats to test state transitions</span>
        </div>

        <div style={{
          backgroundColor: roles.bgSurface,
          border: `1px solid ${roles.borderSubtle}`,
          borderRadius: '12px',
          padding: '36px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Screen Arc */}
          <div style={{ width: '80%', maxWidth: '480px', marginBottom: '28px', textAlign: 'center' }}>
            <div style={{
              height: '5px',
              width: '100%',
              borderRadius: '50% 50% 0 0',
              backgroundColor: roles.screenArc,
              boxShadow: `0 0 20px ${roles.screenArc}`,
              marginBottom: '8px'
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: roles.textSecondary,
              textTransform: 'uppercase'
            }}>
              Acoustic Laser Cinema Screen
            </span>
          </div>

          {/* Seat Row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: roles.textSecondary, width: '20px' }}>A</span>
            {['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map(seatId => {
              const status = sampleSeatStatus[seatId];
              let bg = roles.seatAvailable;
              let color = roles.textPrimary;
              let border = `1px solid ${roles.borderSubtle}`;

              if (status === 'selected') {
                bg = roles.seatSelected;
                color = roles.btnText;
                border = `1px solid ${roles.accentPrimary}`;
              } else if (status === 'reserved') {
                bg = roles.seatReserved;
                color = roles.accentPrimary;
                border = `1px dashed ${roles.accentPrimary}`;
              } else if (status === 'booked') {
                bg = roles.seatBooked;
                color = roles.textSecondary;
                border = '1px solid rgba(255, 255, 255, 0.04)';
              }

              return (
                <button
                  key={seatId}
                  onClick={() => handleSeatClick(seatId)}
                  title={`${seatId}: ${status} (Click to toggle)`}
                  style={{
                    width: '42px',
                    height: '38px',
                    borderRadius: '6px',
                    backgroundColor: bg,
                    border: border,
                    color: color,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    transform: status === 'selected' ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: status === 'selected' ? `0 0 14px ${roles.accentPrimary}66` : 'none'
                  }}
                >
                  {seatId}
                </button>
              );
            })}
            <span style={{ fontSize: '12px', fontWeight: 700, color: roles.textSecondary, width: '20px', textAlign: 'right' }}>A</span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', fontSize: '12px', color: roles.textSecondary }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: roles.seatAvailable, border: `1px solid ${roles.borderSubtle}` }} />
              <span>Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: roles.seatSelected }} />
              <span style={{ color: roles.textPrimary, fontWeight: 700 }}>Selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: roles.seatReserved, border: `1px dashed ${roles.accentPrimary}` }} />
              <span>Locked (10m OTP)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: roles.seatBooked }} />
              <span>Occupied</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Digital Admission Pass */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: roles.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={18} color={roles.accentPrimary} />
            <span>4. Post-Booking Admission Pass Format</span>
          </h3>
          <span style={{ fontSize: '12px', color: roles.textSecondary }}>Issued after successful verification</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: roles.bgCard,
            border: `1px solid ${roles.borderSubtle}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
              backgroundColor: roles.bgSurface,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 700, color: roles.accentPrimary, textTransform: 'uppercase' }}>
                  CineReserve Digital Ticket
                </span>
                <h3 style={{ fontFamily: fonts.fontDisplay, fontSize: fonts.id === 'bebas' ? '24px' : '19px', color: roles.textPrimary, marginTop: '2px', margin: 0 }}>
                  ANATOMY OF A SHADOW
                </h3>
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: `${roles.accentPrimary}22`,
                border: `1px solid ${roles.accentPrimary}44`,
                color: roles.accentPrimary,
                fontSize: '11px',
                fontWeight: 700
              }}>
                CONFIRMED
              </div>
            </div>

            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: roles.textSecondary, textTransform: 'uppercase' }}>Showtime</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: roles.textPrimary, margin: '2px 0 0 0' }}>Today • 8:15 PM</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: roles.textSecondary, textTransform: 'uppercase' }}>Reserved Seats</span>
                <p style={{ fontSize: '14px', fontWeight: 700, color: roles.accentPrimary, margin: '2px 0 0 0' }}>Row A, Seats 3 & 4</p>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              backgroundColor: roles.bgCanvas,
              borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                height: '26px',
                width: '140px',
                background: 'repeating-linear-gradient(90deg, #fff 0px, #fff 3px, transparent 3px, transparent 6px, #fff 6px, #fff 8px, transparent 8px, transparent 12px)',
                opacity: 0.65
              }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: roles.accentSecondary }}>
                #CR-90428-SECURE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Confirmation Action Box */}
      <div style={{
        backgroundColor: roles.bgSurface,
        border: `2px solid ${roles.accentPrimary}`,
        borderRadius: '12px',
        padding: '28px',
        textAlign: 'center',
        boxShadow: `0 10px 30px ${roles.accentPrimary}22`
      }}>
        <h3 style={{ fontFamily: fonts.fontDisplay, fontSize: fonts.id === 'bebas' ? '28px' : '22px', color: roles.textPrimary, marginBottom: '6px' }}>
          Lock in this Design System?
        </h3>
        <p style={{ fontSize: '14px', color: roles.textSecondary, maxWidth: '640px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
          Active Palette: <strong style={{ color: roles.accentPrimary }}>{paletteName} {isShuffled ? '(Custom Shuffled)' : ''}</strong> paired with <strong style={{ color: roles.accentSecondary }}>{fonts.name}</strong>.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 28px',
          borderRadius: '8px',
          backgroundColor: roles.btnPrimary,
          color: roles.btnText,
          fontSize: '14px',
          fontWeight: 800
        }}>
          <CheckCircle2 size={16} />
          <span>Active Selection: {paletteName}</span>
        </div>
      </div>

    </div>
  );
};
