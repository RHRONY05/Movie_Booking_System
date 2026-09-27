# 🎬 CineReserve — High-Concurrency Movie Booking System

[![CI/CD Pipeline](https://github.com/RHRONY05/Movie_Booking_System/actions/workflows/ci.yml/badge.svg)](https://github.com/RHRONY05/Movie_Booking_System/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15_Alpine-336791?logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy_%26_SSL-009639?logo=nginx)](https://nginx.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Live Production Deployment:** [https://movies.rhrony05.me](https://movies.rhrony05.me)

A production-engineered full-stack cinema reservation platform designed to solve the classic **high-concurrency ticket snapping problem**. Built with PostgreSQL pessimistic row-level locking (`SELECT ... FOR UPDATE`), two-phase seat locking with expiring OTP verification, automated Dockerized CI/CD to a Linux VPS, and a bespoke **Cyber Noir & Electric Teal** cinema aesthetic.

---

## 🏛️ System Architecture

```
                                 [ Internet / User Browser ]
                                              │
                                       HTTPS (Port 443)
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │        Nginx 1.25 Reverse Proxy           │
                        │       (Let's Encrypt TLS / SSL)          │
                        └───────┬───────────────────────────┬───────┘
                                │                           │
                 / (Static Assets, SPA)           /api/* (Reverse Proxy)
                                │                           │
                                ▼                           ▼
         ┌──────────────────────────────┐    ┌──────────────────────────────┐
         │     React 19 + Vite SPA      │    │    Express.js REST API       │
         │  (Nginx Alpine Static Host)  │    │      (Node.js 20 LTS)        │
         └──────────────────────────────┘    └──────────────┬───────────────┘
                                                            │
                                             Pessimistic Lock (`FOR UPDATE`)
                                                            │
                                                            ▼
                                             ┌──────────────────────────────┐
                                             │     PostgreSQL 15 Alpine     │
                                             │   (movie_booking database)   │
                                             └──────────────────────────────┘
```

---

## ✨ Key Engineering Highlights

### 1. Zero-Race-Condition Concurrency Engine
* **The Problem:** When hundreds of moviegoers simultaneously click "Reserve" on the exact same VIP seat (e.g. Row D, Seat 6 during an IMAX premiere), naive database queries create duplicate bookings or data corruption.
* **The Solution:** Wrapped seat reservation in strict SQL transactions (`BEGIN ... COMMIT`) utilizing PostgreSQL pessimistic row-level locking:
  ```sql
  SELECT status FROM seats WHERE id = $1 FOR UPDATE;
  ```
  This immediately places an exclusive lock on that specific seat row in the database engine. Concurrent requests queue cleanly; the first transaction successfully transitions the seat to `RESERVED`, and subsequent transactions immediately receive an `HTTP 409 Conflict` error without race conditions.

### 2. Two-Phase Reservation & Auto-Expiring Seats
* Once locked, the seat transitions to `RESERVED` for **10 minutes**.
* A cryptographically secure 6-digit verification code is generated, salted and hashed with **Bcrypt**, and dispatched to the user's verified email via **Brevo API**.
* An automated background scheduler inspects abandoned seats and releases unverified reservations back to `AVAILABLE` after the expiration threshold.

### 3. Automated CI/CD Deployment Pipeline
Every push to `main` triggers a complete GitHub Actions automation suite:
* **Job 1 (Backend Integration Tests):** Launches an ephemeral PostgreSQL 15 container service, runs database migrations from scratch, and executes **18/18 Jest integration tests** covering concurrency stress tests, Google OAuth, and OTP lifecycle states.
* **Job 2 (Frontend Static Analysis):** Runs Oxlint static code analysis and tests the production Vite bundle compiler.
* **Job 3 (Zero-Downtime VPS Deployment):** Automatically connects to an Azure Linux VPS via SSH, pulls the latest code, executes [`scripts/deploy.sh`](scripts/deploy.sh), rebuilds Docker containers, and validates SSL status.

### 4. Production Security & Container Hardening
* Non-root container execution in lightweight Alpine Linux.
* Google OAuth 2.0 authentication issuing signed, stateless JWT tokens.
* Let's Encrypt TLS/SSL certificates auto-provisioned and renewed via Certbot.
* Production structured logging powered by **Pino** with automated daily log rotation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Vanilla CSS Design System |
| **Backend** | Node.js 20 LTS, Express.js (ES6 Modules), Pino Structured Logger |
| **Database** | PostgreSQL 15, `node-pg-migrate`, Raw SQL Transactions (`FOR UPDATE`) |
| **Security & Auth** | Google OAuth 2.0, JWT, Bcrypt Hashing, Brevo Transactional Email |
| **Testing** | Jest, Supertest, Cross-Env, Oxlint |
| **DevOps & Infra** | Docker, Docker Compose, Nginx, Let's Encrypt Certbot, GitHub Actions |

---

## 🚀 Local Development Setup

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
* [Node.js](https://nodejs.org/) v20+
* Git

### 1. Clone the Repository
```bash
git clone https://github.com/RHRONY05/Movie_Booking_System.git
cd Movie_Booking_System
```

### 2. Configure Environment Variables
Create `.env` inside `backend/`:
```ini
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://admin:password123@localhost:5432/movie_booking
TEST_DATABASE_URL=postgres://admin:password123@localhost:5432/movie_booking_test
JWT_SECRET=super_secret_jwt_key_local_development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_SENDER=no-reply@movies.rhrony05.me
```

Create `.env` inside `frontend/`:
```ini
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Launch Development Environment

You can run the project in either of two ways:

#### Option A: Full Container Stack (Recommended for Quickstart)
Starts PostgreSQL and the Express backend API automatically in Docker:
```bash
cd backend
docker compose up -d --build

# Run schema migrations & seed the catalog inside the container
docker compose exec backend npx node-pg-migrate up
docker compose exec backend npm run seed
```

Then start the frontend:
```bash
cd ../frontend
npm install
npm run dev
# Running on http://localhost:5173
```

#### Option B: Hybrid Development (Docker Postgres + Local Node with Hot-Reload)
Best if you are actively editing backend code and want instant hot-reloads:
```bash
# 1. Start only the PostgreSQL database container
cd backend
docker compose up -d postgres

# 2. Run migrations and seed data locally
npm install
npm run migrate up
npm run seed

# 3. Start local backend with nodemon
npm run dev
# Running on http://localhost:5000

# 4. Start frontend
cd ../frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Running Automated Tests

### Backend Integration Tests (18 Suites)
Runs against an isolated test database with simulated race conditions:
```bash
cd backend
npm test
```

### Frontend Lint & Build Verification
```bash
cd frontend
npm run lint
npm run build
```

---

## 📡 REST API Reference

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | System health check and database connectivity probe |
| `GET` | `/api/movies` | No | List all active premiere movies |
| `GET` | `/api/movies/:id/seats` | No | Real-time seat map and availability layout |
| `POST` | `/api/bookings/initiate` | Yes | Pessimistically locks seat and dispatches 6-digit OTP |
| `POST` | `/api/bookings/verify` | Yes | Validates OTP hash and confirms digital ticket |
| `GET` | `/api/bookings/my-bookings` | Yes | Retrieves user's active digital passes & past history |
| `POST` | `/api/auth/google` | No | Exchanges Google OAuth token for session JWT |
| `GET` | `/api/auth/me` | Yes | Returns current authenticated user profile |

---

## 📦 Production Deployment (Azure Linux VPS)

To deploy manually or inspect production containers on the VPS:

```bash
# 1. SSH into the production server
ssh <username>@<server-ip>

# 2. Navigate to project root
cd ~/Movie_booking_system

# 3. Pull latest code and rebuild production containers
bash scripts/deploy.sh

# 4. Seed the production catalog (one-time initialization)
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
