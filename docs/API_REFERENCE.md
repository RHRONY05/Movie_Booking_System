# API Contract Reference & Dictionary

> **Project:** Movie Booking System  
> **Location:** `docs/API_REFERENCE.md`

---

## 1. Summary Endpoint Matrix

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/health` | No | System health check & uptime probe |
| `POST` | `/api/auth/google` | No | Authenticate Google token, upsert user, return JWT |
| `GET` | `/api/auth/me` | **Yes** (Bearer JWT) | Retrieve currently authenticated user profile |
| `POST` | `/api/bookings/initiate` | **Yes** (Bearer JWT) | Lock seat, create pending booking, dispatch OTP |
| `POST` | `/api/bookings/verify` | **Yes** (Bearer JWT) | Validate OTP, confirm booking, mark seat booked |

---

## 2. Detailed Endpoint Contracts

### 1. `GET /health`
- **Auth Required:** None
- **Purpose:** Health check probe for load balancers, Docker, and monitoring services.

#### Success Response (200 OK)
```json
{
  "status": "UP",
  "message": "Server is healthy and running smoothly",
  "timestamp": "2026-09-04T14:30:00.000Z"
}
```

---

### 2. `POST /api/auth/google`
- **Auth Required:** None
- **Purpose:** Google OAuth2 ID Token exchange and user synchronization.

#### Request Body
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI..."
}
```

#### Success Response (200 OK)
```json
{
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "ced6e8ad-ca66-4732-a91b-c0e2fd20b910",
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

#### Error Responses
- **400 Bad Request:** `{ "error": "Google token is required" }`
- **401 Unauthorized:** `{ "error": "Invalid or expired Google token" }`

---

### 3. `GET /api/auth/me`
- **Auth Required:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Retrieve the profile data of the currently logged-in user.

#### Success Response (200 OK)
```json
{
  "user": {
    "id": "ced6e8ad-ca66-4732-a91b-c0e2fd20b910",
    "email": "user@example.com",
    "name": "Jane Doe",
    "created_at": "2026-09-04T07:53:16.566Z"
  }
}
```

#### Error Responses
- **401 Unauthorized (Missing Header):** `{ "error": "Authentication required" }`
- **401 Unauthorized (Invalid / Malformed Token):** `{ "error": "Invalid or expired token" }`
- **404 Not Found:** `{ "error": "User not found" }`

---

### 4. `POST /api/bookings/initiate`
- **Auth Required:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Reserve a seat using pessimistic locking, start an ACID transaction, and dispatch a 6-digit OTP to the user's email.

#### Request Body
```json
{
  "seatId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
}
```

#### Success Response (200 OK)
```json
{
  "message": "Seat reserved. Please verify OTP sent to your email to confirm booking.",
  "bookingId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "expiresInMinutes": 10
}
```

#### Error Responses
- **400 Bad Request:** `{ "error": "seatId is required" }`
- **404 Not Found:** `{ "error": "Seat not found" }`
- **409 Conflict (Concurrency Lock):** `{ "error": "Seat is no longer available" }`

---

### 5. `POST /api/bookings/verify`
- **Auth Required:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Verify the 6-digit OTP against the bcrypt hash in PostgreSQL and confirm the reservation.

#### Request Body
```json
{
  "bookingId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "otp": "789456"
}
```

#### Success Response (200 OK)
```json
{
  "message": "Booking confirmed successfully!",
  "booking": {
    "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "user_id": "ced6e8ad-ca66-4732-a91b-c0e2fd20b910",
    "seat_id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "CONFIRMED",
    "created_at": "2026-09-04T12:00:00.000Z"
  }
}
```

#### Error Responses
- **400 Bad Request (Missing Data):** `{ "error": "bookingId and otp are required" }`
- **400 Bad Request (Wrong OTP):** `{ "error": "Invalid OTP" }`
- **400 Bad Request (Expired OTP):** `{ "error": "OTP has expired. Your reservation was cancelled." }`
- **404 Not Found:** `{ "error": "Booking or OTP verification record not found" }`

---

## 3. Background Workers & Automated Tasks

| Worker | Schedule | Action Taken | File Location |
|---|---|---|---|
| **Expired Booking Cleaner** | Every 1 minute (`* * * * *`) | Finds pending bookings older than 10 mins $\rightarrow$ marks them `FAILED` and resets seats back to `AVAILABLE`. | `src/utils/cronJobs.js` |
