import axios from 'axios';


// Base API URL derived from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || '';

// Centralized Axios instance configured for CineReserve backend
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Automatically attach Bearer JWT if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinereserve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwraps standard backend ApiResponse and normalizes ApiError
apiClient.interceptors.response.use(
  (response) => {
    // Backend wraps success in ApiResponse: { statusCode, data, message, success: true }
    return response.data;
  },
  (error) => {
    // Backend returns ApiError: { statusCode, message, errors, success: false }
    const errorPayload = error.response?.data || {
      statusCode: error.response?.status || 500,
      message: error.message || 'An unexpected error occurred',
      errors: [],
      success: false,
    };

    return Promise.reject(errorPayload);
  }
);

/* ==========================================================================
   Domain API Services
   ========================================================================== */

export const authApi = {
  /**
   * Exchange Google credential for application JWT session
   * @param {string} token Google ID token / credential
   */
  googleLogin: (token) => apiClient.post('/api/auth/google', { token }),

  /**
   * Fetch currently authenticated user profile
   */
  getMe: () => apiClient.get('/api/auth/me'),

  /**
   * Log out and invalidate local session
   */
  logout: () => apiClient.post('/api/auth/logout'),
};

export const moviesApi = {
  /**
   * Fetch list of available movies for landing catalog
   */
  getMovies: () => apiClient.get('/api/movies'),

  /**
   * Fetch interactive auditorium seat layout & real-time statuses for a movie
   * @param {string} movieId
   */
  getMovieSeats: (movieId) => apiClient.get(`/api/movies/${movieId}/seats`),
};

export const bookingsApi = {
  /**
   * Initiate seat booking (pessimistic lock + OTP dispatch)
   * @param {{ seatId: string, email: string, userId?: string }} data
   */
  initiateBooking: (data) => apiClient.post('/api/bookings/initiate', data),

  /**
   * Verify OTP to confirm booking and mark seat as BOOKED
   * @param {{ bookingId: string, otp: string }} data
   */
  verifyBooking: (data) => apiClient.post('/api/bookings/verify', data),

  /**
   * Retrieve all confirmed & pending bookings for current user
   */
  getMyBookings: () => apiClient.get('/api/bookings/my-bookings'),
};

export default apiClient;
