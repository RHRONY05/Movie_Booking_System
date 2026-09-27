import React, { useState, useEffect } from 'react';
import { bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TicketPassModal } from '../components/booking/TicketPassModal';
import { OtpModal } from '../components/booking/OtpModal';
import {
  Film,
  QrCode,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Wallet,
  SlidersHorizontal,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

export const MyBookingsPage = ({ onBrowseMovies }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');

  // Modal states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [verifyingBooking, setVerifyingBooking] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Live ticking second ticker for real-time synchronization
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingsApi.getMyBookings();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setBookings(list);
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
      setError(err.message || 'Failed to load your bookings history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getExpiryTime = (b) => {
    if (b.expires_at) return new Date(b.expires_at).getTime();
    if (b.created_at) return new Date(b.created_at).getTime() + 10 * 60 * 1000;
    return Date.now() + 10 * 60 * 1000;
  };

  const isBookingExpired = (b) => {
    if (b.status === 'FAILED') return true;
    if (b.status === 'CONFIRMED') return false;
    return currentTime >= getExpiryTime(b);
  };

  // Active upcoming: CONFIRMED or unexpired PENDING_OTP
  const activeUpcomingBookings = bookings.filter((b) => {
    if (b.status === 'CONFIRMED') return true;
    if (b.status === 'PENDING_OTP' && !isBookingExpired(b)) return true;
    return false;
  });

  // Past: FAILED or expired PENDING_OTP
  const pastBookingsList = bookings.filter((b) => {
    return b.status === 'FAILED' || (b.status === 'PENDING_OTP' && isBookingExpired(b));
  });

  const handleVerifyOtp = async (otp) => {
    if (!verifyingBooking) return;
    try {
      setIsVerifying(true);
      await bookingsApi.verifyBooking({
        bookingId: verifyingBooking.id,
        otp,
      });

      toast.success('Your ticket has been confirmed!', 'Booking Confirmed');
      setVerifyingBooking(null);

      // Refresh bookings to update status to CONFIRMED
      await fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.', 'Verification Failed');
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 'var(--container-max-width)',
        margin: '0 auto',
        padding: 'var(--space-2xl) var(--space-xl) var(--space-3xl) var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2xl)',
      }}
    >
      {/* 1. User Profile Card */}
      <section
        style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--space-2xl)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(192, 132, 252, 0.08) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* User Portrait with PRO Badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary)',
              border: '2px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--btn-text)',
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-black)',
              boxShadow: 'var(--shadow-glow-amethyst)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <span
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              backgroundColor: 'var(--accent-secondary)',
              color: 'var(--btn-text)',
              fontSize: '11px',
              fontWeight: 'var(--font-weight-black)',
              letterSpacing: '0.05em',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-glow-teal)',
            }}
          >
            PRO
          </span>
        </div>

        {/* Profile Info Details */}
        <div style={{ flex: 1, zIndex: 2, minWidth: '220px' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-3xs)',
            }}
          >
            {user?.name || 'Alex Rivers'}
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-md)',
            }}
          >
            {user?.email || 'user@example.com'}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: 'var(--glass-border)',
              padding: 'var(--space-2xs) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--state-available)',
                boxShadow: 'var(--shadow-glow-green)',
              }}
            />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              Active Member
            </span>
          </div>
        </div>

        {/* Edit Profile Action */}
        <div style={{ zIndex: 2 }}>
          <button
            onClick={() => toast.info('Profile settings are managed via your Google account.', 'Google OAuth')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: 'var(--glass-border)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              padding: 'var(--space-sm) var(--space-xl)',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition-fast)',
              cursor: 'pointer',
            }}
          >
            Edit Profile
          </button>
        </div>
      </section>

      {/* 2. Tabs Row (Stitch Specification) */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-xl)',
          borderBottom: 'var(--glass-border)',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: activeTab === 'bookings' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: activeTab === 'bookings' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            paddingBottom: 'var(--space-md)',
            borderBottom: activeTab === 'bookings' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'var(--transition-fast)',
            cursor: 'pointer',
          }}
        >
          My Bookings & Tickets
        </button>

        <button
          onClick={() => {
            setActiveTab('preferences');
            toast.info('Viewing cinema audio & seating preferences.', 'Preferences');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2xs)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: activeTab === 'preferences' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: activeTab === 'preferences' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            paddingBottom: 'var(--space-md)',
            borderBottom: activeTab === 'preferences' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'var(--transition-fast)',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={16} />
          <span>Preferences</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('payments');
            toast.info('Manage saved cards and digital wallet passes.', 'Payment Methods');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2xs)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: activeTab === 'payments' ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: activeTab === 'payments' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            paddingBottom: 'var(--space-md)',
            borderBottom: activeTab === 'payments' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'var(--transition-fast)',
            cursor: 'pointer',
          }}
        >
          <CreditCard size={16} />
          <span>Payment Methods</span>
        </button>
      </div>

      {/* 3. Upcoming Shows / Active Passes */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Upcoming Shows
          </h2>

          <button
            onClick={fetchBookings}
            title="Refresh bookings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
              border: 'var(--glass-border)',
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 'var(--space-xl)' }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="skeleton-shimmer"
                style={{
                  height: '240px',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--bg-surface)',
                  border: 'var(--glass-border)',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && activeUpcomingBookings.length === 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: 'var(--glass-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-3xl) var(--space-xl)',
              textAlign: 'center',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto var(--space-md) auto',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Film size={32} />
            </div>

            <h3
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-xs)',
              }}
            >
              No Upcoming Shows
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-xl)',
              }}
            >
              You haven't reserved any active IMAX movie tickets yet. Pick your favorite seat for currently running blockbuster titles!
            </p>

            <button
              onClick={onBrowseMovies}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm) var(--space-xl)',
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--btn-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: 'var(--shadow-glow-amethyst)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              <span>Browse Now Showing</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Grid of Boarding Passes */}
        {!loading && !error && activeUpcomingBookings.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
              gap: 'var(--space-xl)',
            }}
          >
            {activeUpcomingBookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              const remainingSec = Math.max(0, Math.floor((getExpiryTime(booking) - currentTime) / 1000));
              const min = Math.floor(remainingSec / 60);
              const sec = remainingSec % 60;
              const countdownStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

              return (
                <div
                  key={booking.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    border: isConfirmed ? 'var(--glass-border)' : '1px solid rgba(6, 182, 212, 0.45)',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: isConfirmed 
                      ? 'var(--shadow-elevated)' 
                      : 'var(--shadow-elevated), 0 0 24px rgba(6, 182, 212, 0.18)',
                    display: 'flex',
                    flexDirection: 'row',
                    minHeight: '220px',
                  }}
                >
                  {/* Left: Movie Poster Section */}
                  <div
                    style={{
                      width: '38%',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={booking.poster_url || '/assets/posters/blade_runner_2049.webp'}
                      alt={booking.movie_title}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/posters/blade_runner_2049.webp';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, transparent 30%, var(--bg-card) 100%)',
                      }}
                    />
                  </div>

                  {/* Right: Info & Pass Details */}
                  <div
                    style={{
                      flex: 1,
                      padding: 'var(--space-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div>
                      {/* Title & Status Badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 'var(--space-xs)',
                          marginBottom: 'var(--space-3xs)',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 'var(--font-size-xl)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--text-primary)',
                            lineHeight: 1.2,
                          }}
                        >
                          {booking.movie_title}
                        </h3>

                        {isConfirmed ? (
                          <span
                            style={{
                              backgroundColor: 'rgba(34, 197, 94, 0.12)',
                              border: '1px solid rgba(34, 197, 94, 0.35)',
                              color: 'var(--state-available)',
                              fontSize: '11px',
                              fontWeight: 'var(--font-weight-bold)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: '0 0 10px rgba(34, 197, 94, 0.25)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            CONFIRMED
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: 'rgba(6, 182, 212, 0.12)',
                              border: '1px solid rgba(6, 182, 212, 0.35)',
                              color: 'var(--accent-secondary)',
                              fontSize: '11px',
                              fontWeight: 'var(--font-weight-bold)',
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: '0 0 12px var(--accent-secondary-glow)',
                              whiteSpace: 'nowrap',
                              fontFamily: 'monospace',
                              letterSpacing: '0.04em',
                            }}
                          >
                            ⏳ {countdownStr}
                          </span>
                        )}
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-3xs)' }}>
                        IMAX Laser • Hall 01 • 3D
                      </p>
                      <p
                        style={{
                          color: 'var(--accent-primary)',
                          fontSize: 'var(--font-size-sm)',
                          fontWeight: 'var(--font-weight-bold)',
                          letterSpacing: '0.02em',
                        }}
                      >
                        Today, 7:00 PM
                      </p>
                    </div>

                    {/* Lower Divider: Seat & QR Code */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        borderTop: 'var(--glass-border)',
                        paddingTop: 'var(--space-sm)',
                        marginTop: 'var(--space-sm)',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          SEAT
                        </span>
                        <div
                          style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-bold)',
                            color: isConfirmed ? 'var(--accent-secondary)' : 'var(--text-primary)',
                          }}
                        >
                          Row {booking.seat_number?.charAt(0)}, Seat {booking.seat_number}
                        </div>
                      </div>

                      {/* Mini QR Preview or Status Icon */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          backgroundColor: isConfirmed ? '#ffffff' : 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isConfirmed ? 'var(--bg-canvas)' : 'var(--accent-secondary)',
                          border: isConfirmed ? 'none' : '1px solid rgba(6, 182, 212, 0.3)',
                        }}
                      >
                        {isConfirmed ? <QrCode size={32} /> : <Clock size={24} />}
                      </div>
                    </div>

                    {/* Action Buttons: Different based on Status */}
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                      {isConfirmed ? (
                        <>
                          <button
                            onClick={() =>
                              setSelectedTicket({
                                bookingId: booking.id,
                                movieTitle: booking.movie_title,
                                seatNumber: booking.seat_number,
                              })
                            }
                            style={{
                              flex: 1,
                              padding: 'var(--space-xs) var(--space-md)',
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--btn-text)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 'var(--font-weight-bold)',
                              borderRadius: 'var(--radius-sm)',
                              boxShadow: 'var(--shadow-glow-amethyst)',
                              cursor: 'pointer',
                              border: 'none',
                              transition: 'var(--transition-fast)',
                            }}
                          >
                            View Digital Pass
                          </button>

                          <button
                            onClick={() => toast.success('Apple Wallet pass synced to your device.', 'Wallet Pass')}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              padding: 'var(--space-xs) var(--space-md)',
                              backgroundColor: 'var(--bg-surface-elevated)',
                              border: 'var(--glass-border)',
                              color: 'var(--text-primary)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 'var(--font-weight-medium)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              transition: 'var(--transition-fast)',
                            }}
                          >
                            <Wallet size={14} />
                            <span>Apple Wallet</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            setVerifyingBooking({
                              id: booking.id,
                              bookingId: booking.id,
                              movieTitle: booking.movie_title,
                              seatNumber: booking.seat_number,
                              expires_at: booking.expires_at,
                            })
                          }
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-xs)',
                            padding: 'var(--space-sm) var(--space-md)',
                            backgroundColor: 'rgba(6, 182, 212, 0.12)',
                            border: '1px solid var(--accent-secondary)',
                            color: 'var(--accent-secondary)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-bold)',
                            letterSpacing: '0.04em',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            boxShadow: '0 0 14px rgba(6, 182, 212, 0.2)',
                            transition: 'var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
                            e.currentTarget.style.color = 'var(--btn-text)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.12)';
                            e.currentTarget.style.color = 'var(--accent-secondary)';
                          }}
                        >
                          <Clock size={14} />
                          <span>ENTER OTP TO CONFIRM ({countdownStr})</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Past Bookings Section (Stitch Specification) */}
      <section style={{ marginTop: 'var(--space-lg)' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            borderBottom: 'var(--glass-border)',
            paddingBottom: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          Past Bookings
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {/* Dynamically Render Any Expired / Failed Reservations */}
          {pastBookingsList.map((expiredBooking) => (
            <div
              key={expiredBooking.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: 'var(--glass-border)',
                opacity: 0.75,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div
                  style={{
                    width: '48px',
                    height: '64px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: 'var(--glass-border)',
                  }}
                >
                  <img
                    src={expiredBooking.poster_url || '/assets/posters/blade_runner_2049.webp'}
                    alt={expiredBooking.movie_title}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/posters/blade_runner_2049.webp';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
                  />
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                    {expiredBooking.movie_title} (Seat {expiredBooking.seat_number})
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    IMAX Laser • Hall 01 • Seat Released
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--glass-border)',
                    letterSpacing: '0.04em',
                  }}
                >
                  EXPIRED
                </span>
              </div>
            </div>
          ))}

          {/* Historical Sample 1: Dune: Part Two */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: 'var(--glass-border)',
              opacity: 0.9,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div
                style={{
                  width: '48px',
                  height: '64px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src="/assets/posters/dune_part_two.webp"
                  alt="Dune: Part Two"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/posters/blade_runner_2049.webp';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%)' }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                  Dune: Part Two
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Aug 24, 2026 • IMAX 70mm • Hall 01
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                $15.00
              </p>
              <span style={{ fontSize: '11px', color: 'var(--state-available)', fontWeight: 'var(--font-weight-medium)' }}>Completed</span>
            </div>
          </div>

          {/* Historical Sample 2: Interstellar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: 'var(--glass-border)',
              opacity: 0.9,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div
                style={{
                  width: '48px',
                  height: '64px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src="/assets/posters/interstellar.webp"
                  alt="Interstellar"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/posters/blade_runner_2049.webp';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%)' }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                  Interstellar
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Jul 18, 2026 • Dolby Atmos • Hall 02
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                $15.00
              </p>
              <span style={{ fontSize: '11px', color: 'var(--state-available)', fontWeight: 'var(--font-weight-medium)' }}>Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmed Ticket Pass Modal */}
      <TicketPassModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticketData={selectedTicket}
      />

      {/* OTP Verification Modal (for pending reservations) */}
      <OtpModal
        isOpen={!!verifyingBooking}
        onClose={() => setVerifyingBooking(null)}
        onVerify={handleVerifyOtp}
        bookingData={verifyingBooking}
        loading={isVerifying}
      />
    </div>
  );
};

export default MyBookingsPage;
