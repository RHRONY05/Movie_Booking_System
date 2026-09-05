## August 21, 2026 Session Log
- **What was built:** Created the monorepo folder structure, set up a PostgreSQL database using Docker Compose, initialized a Node.js environment, and successfully executed our first database migration using `node-pg-migrate` to create the complete database schema (`users`, `movies`, `seats`, `bookings`, `otp_verifications`).
- **What was taught/learned:** Learned how Docker Compose handles networking and volumes to persist data. Learned why migrations use Unix timestamps (chronological ordering) and the concept of `exports.up` (Do) vs `exports.down` (Undo) for database version control.
- **Status/Pending:** Phase 1 is officially 100% complete! The database schema is ready.
- **Open Questions:** Think about how our Express server (which we will build next) will need to communicate with this database. We will need to learn how to route HTTP requests next!

## 2026-09-01 Session Log
- **What was built:** 
  - Completed Phase 2: Built an Express server with industry-standard logging using Pino, pino-http, and pino-roll.
  - Initialized Git and configured `.gitignore` properly. Untracked `.agents` from git.
  - Created a database seed script (`backend/src/scripts/seed.js`) to generate realistic mock data (Movies and 60 seats per movie).
  - Built the `POST /api/bookings/initiate` endpoint.
  - Wrote a concurrency test script (`simulateRace.js`) to prove the race condition vulnerability.
  - Implemented Pessimistic Locking (`SELECT ... FOR UPDATE`) and database Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to successfully solve the race condition.
- **What was taught/learned:** 
  - The difference between `pool.query` (single queries) and `pool.connect` (dedicated clients for transactions).
  - The Event Loop, Promises, and asynchronous concurrency in Node.js (how 100 requests can fire simultaneously without `await`).
  - The theory behind ACID transactions and why Row-Level Locks are necessary for high-traffic inventory systems.
  - Foreign Key constraints and why deletion order matters.
- **Status/Pending:** 
  - Phase 3 is 100% complete. We are currently sitting at the start of Phase 4.
- **Open Questions:** 
  - When we return, we will need to set up Google OAuth. Have you ever set up a Google Cloud Console project before, or should we walk through it together step-by-step?

## September 4-5, 2026 Session Log
- **What was built:**
  - Completed Phase 5: Built full integration test suites with Jest and Supertest (`health.test.js`, `auth.test.js`, `booking.concurrency.test.js`, `booking.verify.test.js`) — 4 test suites, 12 tests, 100% green.
  - Implemented environment-aware Pino logging with silent test output for clean CI/CD reports.
  - Created standardized documentation in `docs/`: `docs/ARCHITECTURE.md` (Dev Technical Flow, Client User Flow, Database ER Diagram) and `docs/API_REFERENCE.md` (complete API contract dictionary).
  - Built custom agent skills: `.agents/skills/plan-project/SKILL.md` (interactive modular vertical slice planner) and `.agents/skills/backend-standards/SKILL.md` (production backend boilerplate standards with fail-fast DB startup, ApiError/ApiResponse/asyncHandler).
  - Created `Notes/universal_architecture_prompt_template.md` for standalone AI prompts.
- **What was taught/learned:**
  - The AAA (Arrange - Act - Assert) testing pattern and test categories (Happy Path, Validation, Auth, Concurrency).
  - Mocking external APIs (`OAuth2Client`, `global.fetch`) and the theory of Monkey Patching prototype methods in memory.
  - Why Supertest injects in-memory requests rather than using live network ports.
  - Fail-fast database architecture (verifying DB pool before `app.listen()`).
  - Database entity modeling: why `Seats` to `Bookings` is 1-to-Many for historical audit records.
- **Status/Pending:**
  - Backend is 100% complete, fully tested, and documented.
  - Phase 5 is officially complete! Ready to start Phase 6 (React + Vite Frontend).
- **Open Questions:**
  - When we start the frontend, we will build a visual seat map. Do you have any preferences on UI styling (e.g. sleek dark cinema mode with glowing seat statuses)?
