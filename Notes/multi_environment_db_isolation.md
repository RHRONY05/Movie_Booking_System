# Multi-Environment Database Isolation & Dynamic Environment Switching

## 1. The Real-World Problem: The "Shared Database" Trap

In naive development setups, automated tests run against the same database used for local development:

```text
❌ ANTI-PATTERN: SHARED DATABASE
┌────────────────────────────────────────────────────────┐
│               PostgreSQL: "movie_booking"              │
│                                                        │
│  [Dev Work / UI] ─────────┐                            │
│  - Real sample movies     │                            │
│  - Active user profiles   ▼                            │
│                      DATABASE                          │
│  [Jest Test Suites] ──────▲                            │
│  - Inserts dummy seats    │                            │
│  - Random users           │                            │
│  - Wipes or aborts data ──┘                            │
└────────────────────────────────────────────────────────┘
```

### Why this breaks in industry:
1. **Data Pollution:** Dummy records like `"Test Movie Endpoint Special"` spill into your React development UI.
2. **Brittle / Flaky Tests:** If a developer manually modifies data in the database while tests are running, assertions fail randomly.
3. **Accidental Data Loss:** If a test cleanup script truncates tables, all active development and manual testing work is instantly wiped out.

---

## 2. Server Instance vs. Logical Database

A key concept in database engineering and DevOps is the difference between a **Database Server Process (Instance)** and a **Logical Database**.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Docker Container ("movie_booking_db" - Port 5432)                       │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database Engine (RDBMS Daemon)                         │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────┐   ┌────────────────────────────┐ │  │
│  │  │ Logical DB: "movie_booking" │   │ Logical DB:                │ │  │
│  │  │ (Development)               │   │ "movie_booking_test"       │ │  │
│  │  │                             │   │ (Test Sandbox)             │ │  │
│  │  │  - users                    │   │  - users (clean)           │ │  │
│  │  │  - movies                   │   │  - movies (clean)          │ │  │
│  │  │  - seats                    │   │  - seats (clean)           │ │  │
│  │  │  - bookings                 │   │  - bookings (clean)        │ │  │
│  │  │  - otp_verifications        │   │  - otp_verifications       │ │  │
│  │  └─────────────────────────────┘   └────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Takeaways:
* **One container, multiple isolated databases:** You do **not** need a second container. A single PostgreSQL engine can manage hundreds of independent logical databases.
* **Complete data separation:** Queries inside `movie_booking_test` cannot see, lock, or corrupt tables in `movie_booking`.
* **Zero extra resource overhead:** No extra memory or ports needed—both share port `5432` under the same PostgreSQL server process.

---

## 3. Why `psql` Requires an Initial Database Connection

When connecting via the CLI:
```powershell
docker exec -it movie_booking_db psql -U admin -d movie_booking -c "CREATE DATABASE movie_booking_test;"
```

### The "Front Door" Protocol:
1. In PostgreSQL, every client connection must attach to a specific database during the initial TCP handshake.
2. If you don't pass `-d <database>`, `psql` defaults to looking for a database with the exact same name as your username (`admin`). Since no database named `admin` exists, it throws: `FATAL: database "admin" does not exist`.
3. Specifying `-d movie_booking` connects you to an existing database first (the "lobby"), where your administrative user can then execute `CREATE DATABASE movie_booking_test;`.

---

## 4. How Automatic Environment Switching Works (`NODE_ENV`)

`NODE_ENV` is an industry-standard convention in the Node.js ecosystem used to signal the current runtime mode (`development`, `test`, or `production`).

### Implementation in `backend/src/config/db.js`:
```javascript
const connectionString =
  process.env.NODE_ENV === 'test'
    ? (process.env.TEST_DATABASE_URL || 'postgres://admin:password123@localhost:5432/movie_booking_test')
    : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});
```

* **When running `npm run dev`:** `NODE_ENV` is not `'test'`(automatically set to development). The application connects to `DATABASE_URL` (`movie_booking`).
* **When running `npm test`:** The script specifies `cross-env NODE_ENV=test`. The code dynamically switches to `TEST_DATABASE_URL` (`movie_booking_test`).
* **Cross-Platform Compatibility:** `cross-env` ensures environment variables work identically across Windows PowerShell, macOS zsh, and Linux bash without command syntax differences.

---

## 5. Automated Schema Synchronization (`pretest` Lifecycle Hook)

In production software development, you never manually copy tables between databases. You use **Migration Scripts** as the single source of truth.

### How Does Running `npm test` Trigger `pretest` Automatically?
A common question is: *"We never mentioned `pretest` inside the `test` command, so how does it know to run?"*

NPM has a built-in, convention-based lifecycle engine. For **any** script defined in `package.json`, NPM automatically reserves two companion prefixes:
* `pre<command>`: Fires **automatically before** `<command>`.
* `post<command>`: Fires **automatically after** `<command>` completes successfully.

```text
       ┌───────────────────────────────┐
       │   Developer runs: "npm test"  │
       └──────────────┬────────────────┘
                      │
                      ▼
    Does "pretest" exist in scripts?
            ├── YES ──► Automatically execute "pretest" first!
            └── NO  ──► Skip
                      │
                      ▼
            Execute "test" command
                      │
                      ▼
    Does "posttest" exist in scripts?
            ├── YES ──► Automatically execute "posttest"!
            └── NO  ──► Finish
```


### Configuration in `backend/package.json`:
```json
"scripts": {
  "migrate": "node-pg-migrate",
  "migrate:test": "cross-env DATABASE_URL=postgres://admin:password123@localhost:5432/movie_booking_test node-pg-migrate up",
  "pretest": "npm run migrate:test",
  "test": "cross-env NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --runInBand",
  "dev": "nodemon src/server.js"
}
```

### The Automatic Flow:
1. Developer runs `npm test`.
2. NPM intercepts the call and runs `pretest` (`npm run migrate:test`).
3. `node-pg-migrate` connects to `movie_booking_test` and applies any pending migration files.
4. Once the schema is guaranteed up to date, Jest starts executing tests.
5. **Developers and CI servers never have to remember to run migrations on the test database manually.**

---
