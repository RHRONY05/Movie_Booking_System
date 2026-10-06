# 🎬 CineReserve — Movie Booking System

> **Live Application:** [https://movires.rhrony05.me](https://movires.rhrony05.me)  
> **API Health:** [https://movie-booking-api.onrender.com/health](https://movie-booking-api.onrender.com/health)

A streamlined cinema reservation application engineered to solve the classic **high-concurrency ticket snapping problem**.

---

## 🚀 Features Implemented

* **Google Sign-In:** One-tap OAuth 2.0 authentication issuing secure, stateless JWT sessions.
* **Ticket Booking with OTP Verification:** Two-phase seat reservation process. Selecting seats reserves them temporarily and dispatches an expiring verification OTP to the user's email before confirming the booking.
* **100-User Concurrency Solution:** Prevents race conditions when 100+ users attempt to book the exact same seat simultaneously. Solved using PostgreSQL **pessimistic row-level locking (`SELECT ... FOR UPDATE`)** inside database transactions—guaranteeing that exactly 1 user secures the seat while all concurrent requests receive an immediate, safe conflict error without double-bookings.

---

## 🛠️ How to Test Locally

### 1. Prerequisites
* **Node.js** v20+
* **PostgreSQL** running locally on port `5432` (or via Docker)

---

### 2. Environment Variables

Create `.env` files in both `backend` and `frontend`:

#### `backend/.env`
```env
PORT=5000
DATABASE_URL=postgres://admin:password123@localhost:5432/movie_booking
TEST_DATABASE_URL=postgres://admin:password123@localhost:5432/movie_booking_test

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key
EMAIL_SENDER=your_email@example.com
```

#### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

### 3. Setup & Run

#### Backend Setup
```bash
cd backend
npm install

# Run database migrations and seed cinema data
npm run migrate up
npm run seed

# Start backend server (runs on port 5000)
npm run dev
```

#### Frontend Setup (In a separate terminal)
```bash
cd frontend
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser to test the full flow.
