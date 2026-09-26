# The Universal Full-Stack Production Playbook
## Architecture, Development Lifecycle & AI Pair-Programming Framework

> **Purpose:** This document is an evergreen, reusable master blueprint for building modern, scalable full-stack applications. It bridges architectural best practices with practical AI pair-programming patterns so you can build production-grade software rapidly and reliably.

---

## 🗺️ Master Architecture & Lifecycle Map

```
========================================================================================
                          STAGE 0: BLUEPRINT & CONTRACTS
========================================================================================
  [ Define Scope & Boundaries ] ──► [ Database Schema (ERD) ] ──► [ API Contract Matrix ]
                                                                             │
=============================================================================│==========
                          STAGE 1: LOCAL FOUNDATION & DATABASE               │
=============================================================================│==========
  ┌──────────────────────────────────────────────────────────────────────────▼─────────┐
  │ • Dockerized PostgreSQL with Persistent Volume (`pgdata`)                           │
  │ • Dual-Environment Database Isolation: `app_dev` (Manual) & `app_test` (Automated) │
  │ • Declarative Migrations Engine (`node-pg-migrate`) & Deterministic Seeding Script   │
  └──────────────────────────────────────────┬─────────────────────────────────────────┘
                                             │
=============================================│==========================================
                          STAGE 2: CORE BACKEND & VERTICAL SLICES
=============================================│==========================================
  ┌──────────────────────────────────────────▼─────────────────────────────────────────┐
  │ • Fail-Fast DB Bootstrapping (Verify pool before `app.listen`)                      │
  │ • Structured JSON Logging (Pino + `pino-roll` rotation; silent in test environment) │
  │ • Standard Response Envelopes (`ApiResponse`, `ApiError`, `asyncHandler`)          │
  │ • Vertical Slice Implementation: Route ➔ Guard ➔ Controller ➔ DB Transaction        │
  │ • Concurrency Defense: Row-level locks (`SELECT ... FOR UPDATE`) & ACID Rollbacks   │
  │ • Automated Integration Tests: Jest + Supertest (Happy path, 400, 401, 409)        │
  └──────────────────────────────────────────┬─────────────────────────────────────────┘
                                             │
=============================================│==========================================
                          STAGE 3: FRONTEND INTEGRATION & STATE MACHINE
=============================================│==========================================
  ┌──────────────────────────────────────────▼─────────────────────────────────────────┐
  │ • Vite + React SPA with Local Proxy (`/api` ➔ `http://localhost:5000`)             │
  │ • Centralized Axios Client with Automatic JWT Interceptors                         │
  │ • Deterministic 4-State Async Pattern (`IDLE` ➔ `LOADING` ➔ `SUCCESS` ➔ `ERROR`)    │
  │ • Clean Separation: Smart Container Pages vs. Presentational UI Components         │
  └──────────────────────────────────────────┬─────────────────────────────────────────┘
                                             │
=============================================│==========================================
                          STAGE 4: PRODUCTION CONTAINERIZATION & NETWORKING
=============================================│==========================================
  ┌──────────────────────────────────────────▼─────────────────────────────────────────┐
  │ • Multi-Stage Frontend Build: Vite Build ➔ Alpine Nginx (~25MB Image)              │
  │ • Multi-Stage Backend Build: Minimal Alpine Image, Non-Root User (`node`)           │
  │ • Production Orchestration (`docker-compose.prod.yml`) on Private Bridge Network   │
  │ • Security Boundary: Port 5432 closed to internet; Nginx terminates 80/443        │
  └──────────────────────────────────────────┬─────────────────────────────────────────┘
                                             │
=============================================│==========================================
                          STAGE 5: CI AUTOMATION (GITHUB ACTIONS)
=============================================│==========================================
  ┌──────────────────────────────────────────▼─────────────────────────────────────────┐
  │ • Ephemeral PostgreSQL Service Container spawned in GitHub Cloud Runner             │
  │ • Automated Trigger on Push/PR: Run Migrations ➔ Execute Integration Test Suite    │
  │ • Merge Block: Code cannot enter `main` if any test fails                          │
  └──────────────────────────────────────────┬─────────────────────────────────────────┘
                                             │
=============================================│==========================================
                          STAGE 6: CLOUD PROVISIONING & CD AUTOMATION
=============================================│==========================================
  ┌──────────────────────────────────────────▼─────────────────────────────────────────┐
  │ • Ubuntu LTS VPS Provisioned (Azure, AWS, DigitalOcean, Hetzner)                   │
  │ • Automated Hardening (`setup-server.sh`): 2GB Swap, UFW Firewall (22, 80, 443)    │
  │ • Custom Domain DNS Mapping (`A` Record ➔ VPS Public IP)                           │
  │ • Automatic SSL/TLS Certificate Issuance & Renewal (Let's Encrypt / Certbot)       │
  │ • Zero-Downtime Deployment (`deploy.sh` & GitHub Actions CD via SSH)                │
  │ • Automated Disaster Recovery (`pg_dump` Daily Backup Cron Job)                    │
  └────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Stage-by-Stage Breakdown

### Stage 0: The Blueprint & Contract Phase
*Goal: Remove ambiguity before writing any code.*

1. **Scope & Non-Goals:**
   - Define what features exist in Version 1.
   - Explicitly define what is out of scope to avoid rabbit holes.
2. **Database Schema Design:**
   - Define entities, data types, UUID primary keys, foreign keys, constraints, and indexes.
   - Produce a visual Entity Relationship Diagram (ERD).
3. **The API Contract Dictionary:**
   - For every endpoint, document:
     - Method + URL path.
     - Auth requirements (Public vs. Authenticated via JWT).
     - Expected Request Body.
     - Standardized 200/201 Success Response.
     - Potential Error Codes (400 Bad Request, 401 Unauthorized, 404 Not Found, 409 Conflict).

---

### Stage 1: Local Foundation & Data Integrity
*Goal: Establish a bulletproof local database environment.*

1. **Dockerized PostgreSQL:**
   - Run PostgreSQL locally inside a Docker container.
   - Use a named volume (`pgdata`) so your data survives container restarts.
2. **Dual-Environment Database Isolation:**
   - Maintain two databases in PostgreSQL:
     - `app_dev`: For active manual testing in the browser.
     - `app_test`: An isolated sandbox that automated test suites wipe and migrate dynamically without destroying dev data.
3. **Declarative Migration Engine:**
   - Use tools like `node-pg-migrate` or Prisma migrations.
   - Every schema modification is an immutable, timestamped file containing `up` and `down` logic.
   - Never run raw `CREATE TABLE` queries inside a database GUI.
4. **Deterministic Seeder:**
   - A repeatable seed script (`npm run seed`) to insert initial test records (admin user, categories, sample inventory).

---

### Stage 2: Core Backend & Vertical Slices
*Goal: Build reliable, self-contained business features following production standards.*

1. **Fail-Fast Bootstrapping:**
   - Always verify the database pool connection *before* calling `app.listen()`. If the DB cannot be reached, terminate immediately (`process.exit(1)`).
2. **Structured Logging (Pino):**
   - No raw `console.log()` in production code.
   - Development: `pino-pretty` for readable console logs.
   - Production: `pino-roll` for daily rotating JSON log files (e.g., `logs/app.log`, capped at 10MB).
   - Test Environment: `level: 'silent'` to keep test runner output clean and legible.
3. **Standard Response Envelopes:**
   - Uniform response shapes eliminate guesswork for frontend developers:
     - `ApiResponse(statusCode, data, message)` ➔ `{ success: true, data: ..., message: "..." }`
     - `ApiError(statusCode, message, errors)` ➔ `{ success: false, message: "...", errors: [...] }`
   - Use an `asyncHandler` wrapper to automatically catch unhandled rejections and forward them to the global error middleware.
4. **Concurrency & Locking:**
   - Any multi-step mutation (e.g. balance deduction, reservation hold, stock check) must be wrapped in an ACID transaction (`BEGIN` ... `COMMIT` / `ROLLBACK`).
   - Use row-level pessimistic locks (`SELECT ... FOR UPDATE`) on contested items to prevent double-booking.
5. **Modular Automated Testing (Jest + Supertest):**
   - For every backend module, write an integration test suite testing 4 mandatory scenarios:
     1. *Happy Path:* Valid inputs return `200` or `201`.
     2. *Validation Error:* Missing/malformed fields return `400`.
     3. *Security Guard:* Missing or invalid tokens return `401`.
     4. *State Conflict:* Concurrent requests or duplicate records return `409`.
   - Mock all 3rd-party external dependencies (OAuth, SendGrid/Brevo email, Stripe) so tests run offline in seconds.

---

### Stage 3: Frontend Integration & State Machine
*Goal: Create a predictable user interface that never enters an unknown state.*

1. **Vite Dev Proxy:**
   - In `vite.config.js`, configure a proxy rule routing `/api` to `http://localhost:5000`.
   - *Advantage:* In local development, the browser makes requests to `http://localhost:5173/api/...`, treating it as same-origin. This completely eliminates CORS issues locally.
2. **Centralized API Service:**
   - Configure a single Axios instance with `baseURL`.
   - Add a request interceptor that reads the JWT from storage and attaches `Authorization: Bearer <token>`.
3. **The 4-State Async Pattern:**
   - Every view or component fetching data must be in one of four explicit states:
     - `IDLE`: Initial load.
     - `LOADING`: Display skeletons or spinners; disable action buttons.
     - `SUCCESS`: Render UI with loaded data.
     - `ERROR`: Show actionable error alert with retry options.
4. **Smart Pages vs. Dumb Components:**
   - Page containers handle router parameters, state management, and API calls.
   - Dumb UI components receive plain props and emit callbacks, making them easily testable and reusable.

---

### Stage 4: Production Containerization & Nginx Routing
*Goal: Package the application into lightweight, reproducible artifacts.*

1. **Multi-Stage Frontend Dockerfile:**
   - **Stage 1 (Builder):** Uses `node:20-alpine` to run `npm run build`.
   - **Stage 2 (Production Runner):** Copies only the built `/dist` assets into an `nginx:alpine` image. The entire final container is under ~25MB and does not contain Node.js or `node_modules`.
2. **Multi-Stage Backend Dockerfile:**
   - Installs dependencies using `npm ci --omit=dev`.
   - Runs under the built-in non-root user (`USER node`) to prevent privilege escalation vulnerabilities.
3. **In-Cluster Nginx Reverse Proxy (`nginx.conf`):**
   - Handles static file serving with aggressive browser caching.
   - Proxies `/api/` traffic internally to `http://backend:5000/`.
4. **Production Orchestration (`docker-compose.prod.yml`):**
   - All services join a private Docker network (`app-network`).
   - The database port (`5432`) is not published to the host machine. Only the backend container can reach it.
   - Nginx is the sole gateway exposing ports `80` and `443`.

---

### Stage 5: Continuous Integration (CI Automation)
*Goal: Automatically prevent bugs from reaching production.*

1. **GitHub Actions Workflow (`.github/workflows/ci.yml`):**
   - Triggers on every push and pull request to `main`.
   - Boots an ephemeral PostgreSQL service container.
   - Installs dependencies, runs database migrations, and executes `npm test`.
   - Code cannot be merged if any automated test fails.

---

### Stage 6: Cloud Provisioning, CD & Disaster Recovery
*Goal: Deploy with high reliability and zero downtime.*

1. **Cloud Server Provisioning:**
   - Launch an Ubuntu 22.04 / 24.04 LTS VPS (Azure, AWS EC2, DigitalOcean, Hetzner).
   - Secure SSH key access (`.pem` / `id_ed25519`).
2. **Automated Server Hardening (`scripts/setup-server.sh`):**
   - Create a 2GB Linux Swap Space to prevent Out-Of-Memory (OOM) killer crashes during Docker builds.
   - Configure Linux `ufw` firewall:
     - `ufw allow 22/tcp` (SSH)
     - `ufw allow 80/tcp` (HTTP)
     - `ufw allow 443/tcp` (HTTPS)
     - `ufw default deny incoming`
   - Install Docker Engine and the Docker Compose plugin.
3. **Custom Domain & SSL/TLS:**
   - Point DNS `A` records to the VPS Public IP.
   - Issue free trusted SSL certificates via Let's Encrypt (`certbot`).
4. **Continuous Deployment (`deploy.sh` & GitHub Actions CD):**
   - Triggered on push to `main` (only after CI passes).
   - SSHs into the VPS, pulls the latest commits, runs database migrations, and restarts the containers with zero downtime:
     ```bash
     docker compose -f docker-compose.prod.yml up -d --build
     docker image prune -f
     ```
5. **Automated Database Backups:**
   - Schedule a daily cron job running `pg_dump` to generate compressed, timestamped backups (`backup_YYYY-MM-DD.sql.gz`).

---

## 🤖 Master AI Prompting Templates

Copy and paste these tailored prompts when working with AI coding assistants (Antigravity, Cursor, Claude Code, ChatGPT) to enforce this architecture at every phase:

### 📋 Prompt 1: Phase 0 (Planning & Database Design)
```markdown
Act as a Principal Software Architect. I am starting a new full-stack project: [PROJECT_NAME].
Here is the core concept: [DESCRIBE APP].

Please help me plan Stage 0:
1. Define the core MVP features and explicitly state what is OUT of scope for V1.
2. Design a PostgreSQL relational schema with UUID primary keys, timestamps, foreign keys, and indexes. Provide a clear ASCII/Mermaid ER diagram.
3. Generate an API Contract Matrix table listing: HTTP Method, Endpoint Path, Auth Required (Yes/No), Request Body JSON, and Success Response JSON.
Do not write application code yet. Let's review the blueprint first.
```

### 📋 Prompt 2: Stage 1 & 2 (Database Migrations & Backend Endpoints)
```markdown
Act as a Senior Backend Engineer following our Production Backend Standards.
We are implementing the [FEATURE_NAME] vertical slice.

Requirements:
1. Create a timestamped migration using `node-pg-migrate` for the required tables/columns.
2. Implement the endpoint following our layered pattern:
   - Use `authMiddleware` to protect the route.
   - Wrap multi-step mutations in a database transaction (`BEGIN` / `COMMIT` / `ROLLBACK`).
   - If the resource has race conditions, use row-level locking (`SELECT ... FOR UPDATE`).
   - Return responses using our `ApiResponse` and `ApiError` standardized envelopes.
   - Use structured logging with Pino (no `console.log`).
3. Write a Jest + Supertest integration test suite covering:
   - Happy path (200/201)
   - Validation failure (400)
   - Unauthorized access (401)
   - Concurrency/Conflict (409)
   - Mock all external third-party API services.
```

### 📋 Prompt 3: Stage 3 (Frontend Integration & 4-State Async UI)
```markdown
Act as a Senior Frontend Engineer.
We need to build the frontend view for [FEATURE_NAME].

Requirements:
1. Use our centralized Axios instance to interact with the backend endpoint: [ENDPOINT_PATH].
2. Implement the strict 4-State Async Pattern:
   - Handle IDLE, LOADING, SUCCESS, and ERROR states explicitly.
   - Disable action buttons during LOADING to prevent duplicate requests.
   - Provide clean, user-friendly error feedback if a 409 Conflict occurs.
3. Separate logic from presentation: create a smart Container Page for state and data fetching, and dumb Presentational Components for the UI rendering.
```

### 📋 Prompt 4: Stage 4 & 5 (Dockerization & Production Reverse Proxy)
```markdown
Act as a Senior DevOps Engineer.
Containerize our full-stack application for production:

1. Frontend Dockerfile: Multi-stage build (Node builder compiling static Vite assets ➔ minimal Nginx Alpine runner).
2. Backend Dockerfile: Multi-stage build with minimal Node Alpine image running under non-root user `node`.
3. `nginx.conf`: Reverse proxy that serves static frontend files, enables gzip/brotli caching, and forwards `/api/*` to the backend container.
4. `docker-compose.prod.yml`: Orchestrate frontend, backend, and PostgreSQL on a private bridge network. Do NOT expose port 5432 to the host.
5. GitHub Actions CI (`ci.yml`): Set up automated testing with an ephemeral PostgreSQL service container on every pull request.
```

---

## ✅ Production Readiness Checklist

Before launching any application to users, verify this 10-point checklist:

- [ ] **1. Fail-Fast Check:** Does the backend exit immediately if the database is offline?
- [ ] **2. Log Hygiene:** Are all `console.log` statements replaced with structured Pino logging?
- [ ] **3. Concurrency Protection:** Are inventory/reservation/payment endpoints protected with transactions and row locks?
- [ ] **4. Test Isolation:** Does `npm test` execute against an isolated test database without wiping dev data?
- [ ] **5. CI Verification:** Does the GitHub Actions CI pipeline pass 100% of integration tests?
- [ ] **6. Production Image Size:** Is the frontend container running on lightweight Nginx (~25MB) rather than a heavy Node server?
- [ ] **7. Database Shielding:** Is PostgreSQL port 5432 inaccessible from the public internet?
- [ ] **8. Server Swap Space:** Is Linux swap configured on the VPS (minimum 2GB) to prevent build memory crashes?
- [ ] **9. SSL Auto-Renewal:** Is Certbot / Let's Encrypt configured to automatically renew HTTPS certificates?
- [ ] **10. Disaster Recovery:** Is an automated `pg_dump` backup cron running daily with compression?
