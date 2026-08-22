# Movie Booking System - Learning & Progress Roadmap

This document serves as our "Living Roadmap." Because this project will span multiple days, this file is designed to maintain the context for both of us (and any future AI agent you chat with). 

**How to use this file:**
*   **AI Context:** Any AI agent can read this file to instantly know what has been built and what the next step is.
*   **Status Indicators:** 
    *   `- [ ]` Not started
    *   `- [/]` In progress
    *   `- [x]` Completed

---

## 📍 Current Project Context & Status
*   **Current Phase:** Phase 2 (Express Server & Industry-Standard Logging)
*   **Last Completed Action:** Finished Phase 2 completely.
*   **Next Immediate Action:** Begin Phase 3: The Core Problem - Concurrency & Locking.

---

## Phase 1: Infrastructure & Database Initialization
**Learning Focus:** Docker Containerization, Relational Database Migrations.
- [x] Create the monorepo folder structure (`frontend`, `backend`, `Notes`).
- [x] Write `docker-compose.yml` to spin up PostgreSQL.
- [x] Verify the database is running and accessible.
- [x] Initialize Node.js in the `backend` folder and install `pg` and `node-pg-migrate`.
- [x] Write and execute the first migration to create `users`, `movies`, `seats`, `bookings`, and `otp_verifications` tables.

## Phase 2: Express Server & Industry-Standard Logging
**Learning Focus:** API routing, high-performance structured logging (Pino), and log rotation.
- [x] Set up the Express server skeleton.
- [x] Implement `pino` and `pino-http` for request logging.
- [x] Configure `pino-roll` to handle automatic log cleanup (log rotation).
- [x] Create the `GET /health` endpoint and verify logs are generating correctly.

## Phase 3: The Core Problem - Concurrency & Locking
**Learning Focus:** Database Transactions, Isolation Levels, and Pessimistic Locking.
- [ ] Seed the database with a dummy movie and seats.
- [ ] Build the `POST /api/bookings/initiate` endpoint *without* locking.
- [ ] Simulate a race condition (100 requests for 1 seat) and observe the failure.
- [ ] Refactor the endpoint to use `BEGIN`, `COMMIT`, and `SELECT ... FOR UPDATE` (Pessimistic Lock).
- [ ] Re-run the simulation to verify the lock correctly rejects 99 requests.

## Phase 4: Authentication & 3rd Party Integrations
**Learning Focus:** OAuth 2.0 (Google), Email APIs (Brevo/SendGrid), Security (Hashing).
- [ ] Implement Google Sign-in (`POST /api/auth/google`) and issue a JWT.
- [ ] Create the `GET /api/auth/me` endpoint to fetch the logged-in profile.
- [ ] Integrate the Brevo/SendGrid SDK to dispatch the OTP email during the booking initiation.
- [ ] Implement `bcrypt` hashing for the OTP before saving to `otp_verifications`.
- [ ] Build the `POST /api/bookings/verify` endpoint to check the OTP and confirm the booking.

## Phase 5: Automated Testing
**Learning Focus:** Unit vs. Integration tests, Mocking external services.
- [ ] Set up `Jest` and `Supertest` in the backend.
- [ ] Write integration tests for the booking endpoint concurrency.
- [ ] Learn how to "Mock" the email provider so tests don't send real emails.

## Phase 6: Frontend & Full-Stack Integration
**Learning Focus:** React components, global state (Context), handling race-condition errors in the UI.
- [ ] Use AI (Stitch) to generate the UI components (Grid, Seat Map, Modals).
- [ ] Set up the React application (`vite` or `next.js`).
- [ ] Build the API service layer (axios) to communicate with the backend.
- [ ] Handle the authentication flow and JWT storage on the frontend.
- [ ] Wire up the seat map to the booking endpoint and gracefully handle "seat already booked" errors.

---
*Note: We will update the `[ ]` checkboxes to `[/]` and `[x]` as we work through this list!*
