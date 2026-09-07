import React, { useState, useEffect } from 'react';
import { ScreenVisualizer } from '../components/cinema/ScreenVisualizer';
import { SeatMap } from '../components/cinema/SeatMap';
import { CheckoutDrawer } from '../components/cinema/CheckoutDrawer';
import { OtpModal } from '../components/booking/OtpModal';
import { TicketPassModal } from '../components/booking/TicketPassModal';
import { moviesApi, bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Clock, MapPin, AlertCircle } from 'lucide-react';

export const SeatSelectionPage = ({ movie, onBack }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [initiating, setInitiating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [conflictError, setConflictError] = useState('');

  // Booking states
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Fetch real seats from backend API
  useEffect(() => {
    const fetchSeats = async () => {
      if (!movie?.id) return;
      try {
        setLoadingSeats(true);
        const res = await moviesApi.getMovieSeats(movie.id);
        const seatList = Array.isArray(res) ? res : (res?.data || []);
        if (seatList.length > 0) {
          setSeats(seatList);
        } else {
          toast.error('No seats available for this movie.', 'Auditorium Notice');
        }
      } catch (err) {
        console.error('Failed to load auditorium seat map from server:', err);
        toast.error('Failed to load seat layout from database.', 'Connection Error');
      } finally {
        setLoadingSeats(false);
      }
    };

    fetchSeats();
  }, [movie]);

  const handleSeatClick = (seat) => {
    setConflictError('');
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat);
    }
  };

  const handleProceedToVerify = async () => {
    if (!selectedSeat) return;

    // Check if user is logged in
    if (!isAuthenticated) {
      toast.info('Please sign in with Google to reserve your seat.', 'Authentication Required');
      openAuthModal();
      return;
    }

    try {
      setInitiating(true);
      setConflictError('');

      // Call backend POST /api/bookings/initiate with pessimistic locking
      const response = await bookingsApi.initiateBooking({
        seatId: selectedSeat.id,
        email: user?.email,
        userId: user?.id,
      });

      const bookingData = response?.booking || response?.data?.booking || response;
      const bookingId = bookingData?.id || `booking-${Date.now()}`;
      const expiresAt = bookingData?.expires_at || new Date(Date.now() + 10 * 60 * 1000).toISOString();

      setPendingBooking({
        bookingId,
        seatId: selectedSeat.id,
        seatNumber: selectedSeat.seat_number,
        movieTitle: movie.title,
        email: user?.email,
        expires_at: expiresAt,
      });

      // Update seat status to RESERVED in local state
      setSeats((prev) =>
        prev.map((s) => (s.id === selectedSeat.id ? { ...s, status: 'RESERVED' } : s))
      );

      toast.info(
        `Seat ${selectedSeat.seat_number} reserved for 10:00 minutes. Verification OTP sent to ${user.email}`,
        'Seat Locked'
      );

      setIsOtpOpen(true);
    } catch (err) {
      console.error('Booking initiation failed:', err);
      // Handle 409 Conflict (Pessimistic lock caught race condition)
      if (err.statusCode === 409 || err.message?.includes('already')) {
        const msg = `Seat ${selectedSeat.seat_number} was just booked by another attendee. Please select another seat.`;
        setConflictError(msg);
        toast.error(msg, 'Seat Snapped Up');
        // Mark that seat as BOOKED immediately in local UI
        setSeats((prev) =>
          prev.map((s) => (s.id === selectedSeat.id ? { ...s, status: 'BOOKED' } : s))
        );
        setSelectedSeat(null);
      } else {
        toast.error(err.message || 'Failed to reserve seat. Please try again.', 'Reservation Error');
      }
    } finally {
      setInitiating(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      setVerifying(true);
      if (pendingBooking?.bookingId && !pendingBooking.bookingId.startsWith('mock-')) {
        await bookingsApi.verifyBooking({
          bookingId: pendingBooking.bookingId,
          otp,
        });
      }

      // Mark seat as BOOKED
      setSeats((prev) =>
        prev.map((s) => (s.id === selectedSeat?.id ? { ...s, status: 'BOOKED' } : s))
      );

      setConfirmedTicket({
        bookingId: pendingBooking?.bookingId || `BK-${Date.now()}`,
        movieTitle: movie.title,
        seatNumber: selectedSeat?.seat_number,
      });

      toast.success(
        `Your booking for ${movie.title} (Seat ${selectedSeat?.seat_number}) is confirmed!`,
        'Booking Confirmed'
      );

      setIsOtpOpen(false);
      setSelectedSeat(null);
      setIsPassOpen(true);
    } catch (err) {
      toast.error(err.message || 'Invalid OTP code. Please check and try again.', 'Verification Failed');
      throw err;
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', padding: 'var(--space-md) var(--space-xl) var(--space-3xl) var(--space-xl)' }}>
      {/* Top Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            transition: 'var(--transition-fast)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Movies</span>
        </button>

        <div style={{ textAlign: 'right' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {movie?.title || 'Auditorium Booking'}
          </h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            IMAX Laser • Hall 01 • 7:00 PM
          </span>
        </div>
      </div>

      {/* Conflict Error Banner */}
      {conflictError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-md)',
            backgroundColor: 'var(--bg-state-error)',
            border: '1px solid var(--state-error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--state-error)',
            fontSize: 'var(--font-size-sm)',
            maxWidth: '820px',
            margin: '0 auto var(--space-lg) auto',
          }}
        >
          <AlertCircle size={18} />
          <span>{conflictError}</span>
        </div>
      )}

      {/* Curved Screen Visualizer */}
      <ScreenVisualizer />

      {/* Seating Grid */}
      <SeatMap
        seats={seats}
        selectedSeat={selectedSeat}
        onSeatClick={handleSeatClick}
      />

      {/* Floating Checkout Drawer */}
      <CheckoutDrawer
        movie={movie}
        selectedSeat={selectedSeat}
        onProceed={handleProceedToVerify}
        loading={initiating}
      />

      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerify={handleVerifyOtp}
        bookingData={pendingBooking}
        loading={verifying}
      />

      {/* Confirmed Ticket Boarding Pass Modal */}
      <TicketPassModal
        isOpen={isPassOpen}
        onClose={() => {
          setIsPassOpen(false);
          onBack();
        }}
        ticketData={confirmedTicket}
      />
    </div>
  );
};

export default SeatSelectionPage;
