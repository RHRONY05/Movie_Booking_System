# Backend & Docker Mastery — Active Recall Q&A Guide

> **Purpose:** Use these questions to test yourself and revise frequently.  
> **How to practice:** Read each question, answer it in your head or on paper, then expand/check the explanation to verify your understanding.

---

## 🏛️ Part 1: Architecture, Node.js & Database

### Q1: What is the "Fail-Fast" startup pattern, and why must the database connect BEFORE `app.listen()`?
<details>
<summary><b>View Answer</b></summary>

- **What it is:** Testing database connection pool health (`await pool.connect()`) before starting the Express HTTP server (`app.listen()`).
- **Why:** If the database credentials are wrong or the DB container is down, we want the server to crash immediately at startup (`process.exit(1)`) rather than accepting client requests that will fail with 500 errors.
</details>

---

### Q2: What is the difference between `pool.query()` and `pool.connect()` in PostgreSQL?
<details>
<summary><b>View Answer</b></summary>

- **`pool.query()`:** Automatically borrows a client connection from the pool, runs a single standalone query, and releases it back immediately. (Used for simple reads/writes).
- **`pool.connect()`:** Checks out a dedicated client connection and holds it. **Required for ACID Transactions** because all commands (`BEGIN`, `SELECT ... FOR UPDATE`, `COMMIT`, `ROLLBACK`) must execute on the *exact same* database connection. Must call `client.release()` in a `finally` block when done.
</details>

---

### Q3: Why is the relationship between `seats` and `bookings` 1-to-Many (`1 : *`) instead of 1-to-1?
<details>
<summary><b>View Answer</b></summary>

- A single physical seat can have **multiple booking attempts over time** in the historical audit trail (e.g. User 1 reserves $\rightarrow$ OTP expires $\rightarrow$ marked `FAILED`; 10 mins later User 2 reserves $\rightarrow$ marked `CONFIRMED`).
- If we enforced 1-to-1 (`UNIQUE (seat_id)`), once a single booking failed or was cancelled, no user would ever be able to book that seat again!
</details>

---

## 🔒 Part 2: Concurrency, Locking & Transactions

### Q4: What is a Race Condition, and how did we simulate it in our tests?
<details>
<summary><b>View Answer</b></summary>

- **Race Condition:** When multiple concurrent requests attempt to read and modify the same resource simultaneously (e.g. 20 users clicking "Book Seat A1" at the exact same millisecond).
- **Simulation:** In `booking.concurrency.test.js`, we used `Promise.all()` to fire 20 simultaneous `supertest` HTTP requests to `/api/bookings/initiate` without awaiting them sequentially.
</details>

---

### Q5: How does Pessimistic Locking (`SELECT ... FOR UPDATE`) solve the double-booking problem?
<details>
<summary><b>View Answer</b></summary>

- When Transaction #1 runs `SELECT * FROM seats WHERE id = $1 FOR UPDATE`, PostgreSQL places an exclusive **Row-Level Lock** on that specific seat record.
- When Transactions #2 through #20 arrive, PostgreSQL **pauses them in a queue** until Transaction #1 finishes (`COMMIT` or `ROLLBACK`).
- Transaction #1 marks the seat `RESERVED` and commits.
- When Transaction #2 is unpaused, it re-reads the row, sees `status = 'RESERVED'`, and is immediately rejected with HTTP `409 Conflict`.
</details>

---

## 🪵 Part 3: Structured Logging (Pino)

### Q6: Why is `pino` preferred over `console.log()` in production?
<details>
<summary><b>View Answer</b></summary>

1. **Performance:** `console.log` is synchronous and blocks the Node.js event loop under heavy traffic. Pino is asynchronous and extremely fast.
2. **Structured JSON:** Pino outputs JSON objects containing timestamp, log level, request ID, and response time, which cloud platforms (Datadog, CloudWatch, Elasticsearch) can search and index.
3. **Log Rotation:** `pino-roll` automatically rotates log files daily or at 10MB limits so your server hard drive never runs out of space.
</details>

---

### Q7: Why must production containers write logs to `process.stdout`?
<details>
<summary><b>View Answer</b></summary>

- According to the **12-Factor App methodology (Factor XI)**, containerized applications should treat logs as event streams to `stdout`.
- Docker, Kubernetes, and cloud providers capture whatever is printed to `stdout`. If an app writes only to a local file, `docker logs` and cloud dashboards remain completely empty.
</details>

---

### Q8: How did we capture HTTP request and response bodies in Pino?
<details>
<summary><b>View Answer</b></summary>

1. **`pino-http`:** Express middleware that automatically logs HTTP methods, URLs, status codes, and response times.
2. **`responseBodyCapture` Middleware:** Overrides Express `res.send()` to save the outgoing JSON payload into `res.locals.responseBody` before sending, allowing the Pino serializer to record the exact response data.
</details>

---

## 🔐 Part 4: Authentication & Security

### Q9: How does Google OAuth 2.0 verification work in our backend?
<details>
<summary><b>View Answer</b></summary>

1. Frontend signs in with Google and receives a cryptographically signed Google ID Token (JWT).
2. Frontend sends token to `POST /api/auth/google`.
3. Backend uses `OAuth2Client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })`.
4. Google's library verifies Google's cryptographic signature and validates expiration date.
5. If valid $\rightarrow$ extracts `{ sub: googleId, email, name }`, upserts user into PostgreSQL, and issues our own 7-day session JWT.
</details>

---

### Q10: Why do we hash OTPs with `bcrypt` before storing them in the database?
<details>
<summary><b>View Answer</b></summary>

- **Defense in Depth:** If an attacker gets read access or a SQL dump of your `otp_verifications` table, they cannot see the active 6-digit OTPs in plaintext.
- When the user submits their code at `/api/bookings/verify`, we use `bcrypt.compare(enteredOtp, hashedOtp)` to safely validate without exposing raw codes.
</details>

---

## 🧪 Part 5: Automated Testing (Jest & Supertest)

### Q11: What are the distinct roles of Jest vs. Supertest?
<details>
<summary><b>View Answer</b></summary>

- **Jest:** The **Test Runner & Assertion Engine**. Executes test files, provides `expect()`, manages mocks (`jest.spyOn`), and reports pass/fail tables.
- **Supertest:** The **HTTP Client**. Injects synthetic HTTP requests directly into your Express `app` in-memory without needing to bind to an actual network port (`localhost:5000`).
</details>

---

### Q12: What is the AAA pattern in testing?
<details>
<summary><b>View Answer</b></summary>

Every automated test follows 3 steps:
1. **Arrange:** Set up test state (clean DB tables, prepare mock return values, generate auth tokens).
2. **Act:** Trigger the action being tested (send HTTP request via `supertest`).
3. **Assert:** Check expectations (verify HTTP status code, response body fields, and database row changes).
</details>

---

### Q13: What is "Monkey Patching" and how does `jest.spyOn` mock external APIs in memory?
<details>
<summary><b>View Answer</b></summary>

- In JavaScript/Node.js, modules share prototype objects in memory.
- `jest.spyOn(OAuth2Client.prototype, 'verifyIdToken')` temporarily replaces the pointer to Google's real network function with a fake Jest wrapper function.
- When the controller calls `client.verifyIdToken()`, it unknowingly executes the mock wrapper, which returns our prepared fake payload in 0ms without hitting Google's servers.
- `mockRestore()` puts the real function back when testing completes.
</details>

---

### Q14: If Pino is silent during tests, how do we know if a test fails and why?
<details>
<summary><b>View Answer</b></summary>

- **Pino** is the application logger, but **Jest** is the test reporter.
- If an assertion fails (`expect(res.status).toBe(200)` received `500`), Jest intercepts the failure and prints the exact test name, line number, and expected vs. received diff in bright red.
- Silencing Pino only hides background server clutter; it does NOT hide Jest test failures!
</details>

---

## 🐳 Part 6: Docker & Container Orchestration

### Q15: Why is a Docker container NOT a Virtual Machine?
<details>
<summary><b>View Answer</b></summary>

- A VM simulates fake hardware and runs a heavy guest OS kernel.
- A Container is an ordinary Linux process running directly on the host machine's physical hardware (CPU, RAM, SSD, NIC).
- It uses Linux **Namespaces** (virtual walls for PIDs, mount points, and networks) and **Cgroups** (CPU/RAM resource limits) for isolation.
</details>

---

### Q16: How does Docker Container-to-Container networking and DNS work?
<details>
<summary><b>View Answer</b></summary>

- Docker Compose creates an internal virtual bridge network (`backend_default`).
- All containers in that compose file attach to this bridge and get private internal IPs (e.g. `172.20.0.2`, `172.20.0.3`).
- Docker runs an embedded DNS server at `127.0.0.11` that translates service names (`postgres`) into the database container's internal IP.
- This is why the backend uses `DATABASE_URL: postgres://admin:...@postgres:5432/...` instead of `localhost`.
</details>

---

### Q17: What is the difference between a Named Volume and a Bind Mount?
<details>
<summary><b>View Answer</b></summary>

1. **Named Volume (`pgdata:/var/lib/postgresql/data`):** Managed completely inside Docker's high-speed virtual storage engine. Required for database persistence across container restarts. Declared in top-level `volumes:` block.
2. **Bind Mount (`./logs:/app/logs`):** A direct mirror to a folder that already exists on your physical host machine (Windows). When the container writes to `/app/logs`, it immediately appears in your `backend/logs` folder on Windows.
</details>

---

### Q18: Why do we copy `package*.json` BEFORE `COPY src ./src` in a `Dockerfile`?
<details>
<summary><b>View Answer</b></summary>

- **Docker Layer Caching:** Docker caches image layers from top to bottom.
- If you copy `src/` first, every single code change invalidates the cache and forces Docker to re-download all npm packages (`npm ci`) from scratch.
- By copying `package.json` and running `npm ci` first, Docker reuses the cached dependencies layer and rebuilds your code edits in **0.1 seconds**!
</details>
