# 04 — Docker Compose

> **Module 4 in Docker Series**  
> **Topic:** The 4 Pillars of Docker Compose, Red Flags / Do's & Don'ts, Container Security (Non-Root User), Healthchecks, One-Shot Tasks, and Dev vs. Prod Volume Architecture.

---

## 1. The 4 Pillars of Docker Compose

AI can write YAML in seconds, but as an engineer you must know how to inspect and evaluate it. Every Docker Compose file is built on 4 pillars:

```text
┌──────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE FILE                       │
│                                                              │
│  1. SERVICES   ──► Who computes? (Backend, DB)               │
│  2. NETWORKS   ──► Private intercom lines between them       │
│  3. VOLUMES    ──► Where data lives permanently on disk      │
│  4. CONFIG     ──► Ports, secrets, startup dependencies      │
└──────────────────────────────────────────────────────────────┘
```

### Pillar 1: Services (`image:` vs `build:`)
* **`image:`**: Pulls a ready-made pre-built image from Docker Hub (e.g. `postgres:15-alpine`).
* **`build:`**: Compiles your local code into a custom image using a `Dockerfile`.
* **The Context Boundary:** `context: ./backend` means Docker can only see files inside that folder. It cannot reach outside to parent folders.

### Pillar 2: Container Networking & The `localhost` Trap
* **Inside a container, `localhost` means THAT SPECIFIC CONTAINER, not your laptop and not sibling containers.**
* If your backend calls `postgres://localhost:5432`, it crashes because PostgreSQL is in another container.
* **Service Discovery via Internal DNS:** Containers talk using their service names:
  ```text
  DATABASE_URL=postgres://admin:password123@postgres:5432/movie_booking
                                            ▲
                              Matches the service name!
  ```

### Pillar 3: Volumes (Ephemeral vs. Persistent)
* Containers are **ephemeral** (disposable). If a container is destroyed, its internal disk is wiped clean.
* **Named Volumes (`pgdata_prod:/var/lib/postgresql/data`)**: A folder managed by Docker on your host drive that survives container restarts, updates, and recreations.
* **Bind Mounts (`./backend/logs:/app/logs`)**: Maps a folder from your laptop directly into the container for live real-time syncing.

### Pillar 4: Ports vs. Private Network (Security Perimeter)
* **`ports: ["8081:80"]` (Host:Container)**: Punches a hole through the firewall to the outside world.
* **No `ports:` section**: The container has **zero public doors**. It is only reachable internally by other containers on the same private Docker network.
* **Industry Rule:** Only Nginx should have public ports. Databases and internal APIs should remain private.

---

## 2. Docker Compose Red Flags (Do's & Don'ts)

### ❌ Red Flag 1: The Naive `depends_on` Trap (Race Condition)
```yaml
# ❌ DANGEROUS:
backend:
  depends_on:
    - postgres
```
* **Why it breaks:** Docker only waits for the `postgres` process to start, not for PostgreSQL to finish loading its database engine. The backend tries to query immediately, gets `connection refused`, and crashes.
* **✅ The Fix:**
  ```yaml
  backend:
    depends_on:
      postgres:
        condition: service_healthy
  ```

### ❌ Red Flag 2: Hardcoded Secrets in Plain Text
* Never write `JWT_SECRET: my_secret_key` directly in YAML.
* Use `${JWT_SECRET}` or `env_file: ./backend/.env` (with `.env` added to `.gitignore`).

### ❌ Red Flag 3: Looping One-Shot Tasks
* One-time tasks (like migrations) must use `restart: "no"`.
* If you set `restart: always` on a migration script, it will execute, exit, and loop infinitely.

### ❌ Red Flag 4: Accidental Data Destruction (`docker compose down -v`)
* `docker compose down`: Stops containers and network safely. Data is preserved.
* `docker compose down -v`: **Deletes all named volumes!** Running this in production permanently wipes all database data.

---

## 3. Container Security: The Non-Root User

By default, Docker containers run everything as **`root` (superuser / UID 0)**.
* **The Risk:** If an attacker exploits an npm vulnerability or code injection, they have full root control inside the container, risking a host container breakout.
* **Principle of Least Privilege:** Production containers must run under an unprivileged user.

```dockerfile
# 1. Give file ownership to the pre-existing 'node' user
RUN chown -R node:node /app

# 2. Switch to 'node' user
USER node

# 3. Server runs with restricted permissions
CMD ["node", "src/server.js"]
```

### Verification:
```powershell
docker run --rm movie_booking_backend:latest whoami
# Output: node
```

---

## 4. Container Healthchecks & Startup Coordination

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-admin} -d ${POSTGRES_DB:-movie_booking}"]
  interval: 5s
  timeout: 5s
  retries: 5
```

```text
PostgreSQL Starts ──► "pg_isready" tests internal socket ──► Exit Code 0 ──► "HEALTHY"
                                                                                 │
                                                                                 ▼
                                                      Backend is now allowed to launch!
```

---

## 5. Automated One-Shot Migration Pattern

In production with multiple backend replicas, running migrations in `server.js` causes deadly database lock collisions when multiple containers boot at the same second.

```yaml
# 1. Runs migration ONCE, then exits cleanly
migration:
  build: ./backend
  restart: "no"
  command: ["npx", "node-pg-migrate", "up"]
  depends_on:
    postgres:
      condition: service_healthy

# 2. Backend waits for migration to finish successfully before starting
backend:
  depends_on:
    postgres:
      condition: service_healthy
    migration:
      condition: service_completed_successfully # The Coordination Gate
```

---

## 6. Dynamic Port Fallbacks (`${FRONTEND_PORT:-8081}:80`)

Uses Bash parameter expansion syntax: `${VARIABLE:-FALLBACK}`.
* On your local machine: `FRONTEND_PORT` is undefined ➔ defaults to `8081:80` (avoids port collisions).
* On a production server: add `FRONTEND_PORT=80` in `.env` ➔ binds standard port `80:80` without touching the YAML!

---

## 7. Essential Docker Compose CLI Commands Cheat Sheet

```bash
# 1. Build images and start all containers in background
docker compose -f docker-compose.prod.yml up -d --build

# 2. View status of all running services (health, ports, uptime)
docker compose -f docker-compose.prod.yml ps

# 3. View live streaming logs from ALL containers
docker compose -f docker-compose.prod.yml logs -f

# 4. View live streaming logs from ONLY one service (e.g. backend)
docker compose -f docker-compose.prod.yml logs -f backend

# 5. Execute an on-demand command inside a running service
docker compose -f docker-compose.prod.yml exec backend node src/scripts/seed.js

# 6. Stop all containers safely (preserves persistent volume data)
docker compose -f docker-compose.prod.yml down

# 7. Stop and DELETE containers, networks, AND named volumes (Permanent data wipe!)
docker compose -f docker-compose.prod.yml down -v
```

