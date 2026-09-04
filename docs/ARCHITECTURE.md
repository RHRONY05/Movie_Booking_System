# System Architecture & Flows

> **Project:** Movie Booking System  
> **Location:** `docs/ARCHITECTURE.md`

---

## 1. Developer Technical Lifecycle Diagram

This diagram traces how a complex, critical request (`POST /api/bookings/initiate`) moves through our layered architecture:

```
┌─────────────────┐
│     CLIENT      │ (React Frontend / Mobile App)
└────────┬────────┘
         │ 1. HTTP Request (POST /api/bookings/initiate + Bearer JWT)
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. GLOBAL MIDDLEWARE LAYER                                   │
│    ├── cors()                   (Enables cross-origin calls)│
│    ├── express.json()           (Parses JSON request body)  │
│    ├── responseBodyCapture()    (Captures response for Pino)│
│    └── pino-http logger         (Logs incoming request)     │
└────────┬────────────────────────────────────────────────────┘
         │ 2. Forward to Route
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ROUTE & AUTHENTICATION GUARD LAYER                       │
│    ├── router.post('/api/bookings/initiate')                │
│    └── authMiddleware.js        (Verifies JWT signature,    │
│                                  decodes userId into req.user)
└────────┬────────────────────────────────────────────────────┘
         │ 3. Authenticated & Forwarded to Controller
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CONTROLLER & BUSINESS LOGIC LAYER                        │
│    └── bookingController.js                                 │
│        ├── Extracts { seatId } and req.user.userId          │
│        └── Starts Database Transaction (pool.connect())     │
└────────┬────────────────────────────────────────────────────┘
         │ 4. Execute Queries & Call External Services
         ├────────────────────────────────┬───────────────────┐
         ▼                                ▼                   ▼
┌──────────────────┐             ┌─────────────────┐ ┌─────────────────┐
│ PostgreSQL DB    │             │  bcrypt Hashing │ │   Brevo Email   │
│ ──────────────── │             │  ────────────── │ │   ───────────   │
│ - BEGIN          │             │  - Hash 6-digit │ │ - Native fetch  │
│ - SELECT FOR     │             │    OTP before DB│ │   sends OTP to  │
│   UPDATE (Lock)  │             │    storage      │ │   user inbox    │
│ - INSERT booking │             └─────────────────┘ └─────────────────┘
│ - INSERT OTP     │
│ - COMMIT         │
└────────┬─────────┘
         │ 5. Results returned to Controller
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RESPONSE DISPATCH & LOGGING                              │
│    ├── Controller sends: res.status(200).json(...)          │
│    ├── responseBodyCapture & Pino log response & duration   │
│    └── Client receives final JSON response                  │
└────────┬────────────────────────────────────────────────────┘
         │ 6. HTTP 200 OK
         ▼
┌─────────────────┐
│     CLIENT      │ (Updates UI / Transitions to OTP Screen)
└─────────────────┘
```

---

## 2. Client & Stakeholder User Journey

High-level business workflow (zero technical jargon, suitable for clients, product managers, and non-technical stakeholders):

```
┌──────────────┐
│ Movie Lover  │
└──────┬───────┘
       │ 1. Signs in with Google
       ▼
┌─────────────────────────┐
│ Selects Movie & Showtime │
└──────┬──────────────────┘
       │ 2. Clicks on an Available Seat
       ▼
┌──────────────────────────────────────────────────────────┐
│ SYSTEM PLACES 10-MINUTE HOLD ON SEAT                     │
│ (No other customer can grab this seat while you finish)  │
└──────┬───────────────────────────────────────────────────┘
       │ 3. System sends 6-Digit Security Code to your Email
       ▼
┌─────────────────────────┐
│ User enters 6-Digit Code│
└──────┬──────────────────┘
       ├───────────────────────────────────────────┐
       │ (Valid Code)                              │ (Timer runs out / Wrong Code)
       ▼                                           ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│ ✅ BOOKING CONFIRMED!        │     │ ❌ RESERVATION CANCELLED    │
│ Ticket issued & Seat Locked │     │ Seat released back to public│
└─────────────────────────────┘     └─────────────────────────────┘
```

---

## 3. Database Entity Relationship (ER) Diagram

```
 ┌───────────────┐          ┌───────────────┐
 │     USERS     │          │    MOVIES     │
 │ ───────────── │          │ ───────────── │
 │ id (UUID, PK) │          │ id (UUID, PK) │
 │ google_id     │          │ title         │
 │ email         │          │ duration_mins │
 │ name          │          │ release_date  │
 └───────┬───────┘          └───────┬───────┘
         │ 1                        │ 1
         │                          │
         │ has many                 │ has many
         ▼ *                        ▼ *
 ┌───────────────┐          ┌───────────────┐
 │   BOOKINGS    │ *      1 │     SEATS     │
 │ ───────────── │──────────│ ───────────── │
 │ id (UUID, PK) │          │ id (UUID, PK) │
 │ user_id (FK)  │          │ movie_id (FK) │
 │ seat_id (FK)  │          │ seat_number   │
 │ status        │          │ status        │
 └───────┬───────┘          └───────────────┘
         │ 1
         │ has 1
         ▼ 1
 ┌────────────────────┐
 │  OTP_VERIFICATIONS │
 │ ────────────────── │
 │ id (UUID, PK)      │
 │ booking_id (FK)    │
 │ otp_hash           │
 │ expires_at         │
 └────────────────────┘
```

### Relationship Design Notes:
- **`SEATS` to `BOOKINGS` is 1-to-Many (`1 : *`):** A single seat can have multiple failed/cancelled booking attempts in the historical audit log, but only 1 active reserved/confirmed booking at any given time.
- **`BOOKINGS` to `OTP_VERIFICATIONS` is 1-to-1 (`1 : 1`):** Each booking has exactly one active OTP challenge record.
