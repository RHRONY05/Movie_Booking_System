# Movie Booking System - Complete Project Plan

This document serves as the master blueprint for our application architecture, folder structure, UI design, and database schema.

## 1. Repository Structure (Monorepo)

We will follow the industry-standard monorepo structure, keeping the frontend, backend, and documentation in a single repository. The database configuration (Docker) will live inside the backend folder.

```text
Movie_Booking_System/
├── frontend/             # React Application
│   ├── src/
│   │   ├── components/   # Reusable UI components (Buttons, Modals, SeatMap)
│   │   ├── pages/        # Route components (Home, Booking, Profile)
│   │   ├── services/     # API calls to backend (axios/fetch wrappers)
│   │   ├── context/      # React Context (Auth state management)
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Helper functions
│   └── package.json
├── backend/              # Node/Express Application
│   ├── src/
│   │   ├── controllers/  # Route handlers (Logic for endpoints)
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Business logic (DB transactions, locking)
│   │   ├── models/       # Database queries
│   │   ├── middlewares/  # Auth (JWT verification), logging, error handling
│   │   ├── config/       # Environment vars, DB connections
│   │   └── utils/        # Logger setup, Hash functions
│   ├── migrations/       # DB schema changes (node-pg-migrate)
│   ├── tests/            # Jest integration/unit tests
│   ├── docker-compose.yml# PostgreSQL Docker setup
│   └── package.json
└── Notes/                # Learning notes and documentation (Markdown files)
```

## 2. UI/UX Design Requirements

The UI will be premium, neat, and clean, mimicking a real production movie booking site.

**Required Screens:**
1.  **Landing Page:** A dynamic grid displaying available movies with movie posters, titles, and showtimes.
2.  **Authentication Modals:** Clean, modern Sign-In and Sign-Up modals utilizing Google Auth.
3.  **Booking/Seat Map Page:** A visual representation of the cinema layout. Seats will be color-coded (Available, Selected, Booked).
4.  **OTP Verification Modal:** A simple numeric input modal that appears when a seat is temporarily reserved.
5.  **Confirmation/Profile Page:** A user dashboard showing their confirmed bookings and basic profile details.

## 3. Database Schema

We will use PostgreSQL. Here is the updated schema including OTP hashing and User sessions.

1.  **`users`**
    *   `id` (UUID, Primary Key)
    *   `google_id` (String, Unique)
    *   `email` (String, Unique)
    *   `name` (String)
    *   `created_at` (Timestamp)
2.  **`movies`**
    *   `id` (UUID, Primary Key)
    *   `title` (String)
    *   `poster_url` (String)
    *   `showtime` (Timestamp)
3.  **`seats`**
    *   `id` (UUID, Primary Key)
    *   `movie_id` (UUID, Foreign Key)
    *   `seat_number` (String - e.g., "A1", "B4")
    *   `status` (Enum: 'AVAILABLE', 'RESERVED', 'BOOKED')
4.  **`bookings`**
    *   `id` (UUID, Primary Key)
    *   `user_id` (UUID, Foreign Key)
    *   `seat_id` (UUID, Foreign Key)
    *   `status` (Enum: 'PENDING_OTP', 'CONFIRMED', 'FAILED')
    *   `created_at` (Timestamp)
5.  **`otp_verifications`** *(New)*
    *   `id` (UUID, Primary Key)
    *   `booking_id` (UUID, Foreign Key)
    *   `otp_hash` (String) - *We will hash the OTP using bcrypt before storing it, just like a password.*
    *   `expires_at` (Timestamp) - *Usually 5-10 minutes from creation.*

## 4. Backend Endpoints (REST API)

We will use JWT (JSON Web Tokens) for authentication. When a user logs in, we send a JWT back to the frontend (often stored in an HttpOnly cookie or LocalStorage). The frontend sends this token with every subsequent request, so the user stays logged in without needing to store a session in the database.

*   **System**
    *   `GET /health` - Returns 200 OK. Used by Docker/Load Balancers to verify the API is running.
*   **Movies**
    *   `GET /api/movies` - Fetch the list of available movies for the landing page.
    *   `GET /api/movies/:id/seats` - Fetch the seat map and availability for a specific movie.
*   **Authentication & Users**
    *   `POST /api/auth/google` - Receives Google credentials, creates/finds the user, and returns a JWT.
    *   `GET /api/auth/me` - Validates the JWT and returns the logged-in user's profile data (used when the user re-opens the website).
    *   `POST /api/auth/logout` - Clears the authentication token.
*   **Bookings (The Core Logic)**
    *   `POST /api/bookings/initiate` - Applies DB row lock (`SELECT FOR UPDATE`), checks seat status. If available, updates status to `RESERVED`, generates OTP, hashes it, saves to `otp_verifications`, and triggers the email.
    *   `POST /api/bookings/verify` - Takes the user's OTP input, hashes it, compares it with the database. If it matches, marks booking as `CONFIRMED` and seat as `BOOKED`.
