# 02 — Docker Compose, Networking & Service Orchestration

> **Module 2 of 3 in Docker Series**  
> **Topic:** Docker Compose Architecture, Internal DNS Networking, Health Checks, and Environment Variables.

---

## 1. What is Docker Compose? (The Conductor)

If Docker is the engine that runs single isolated containers, **Docker Compose** is the orchestra conductor.

Instead of typing 10 complex terminal commands to start a database, create networks, attach volumes, and start a backend, you declare your entire architecture in a single text file (`docker-compose.yml`).

With one command (`docker compose up`), Docker Compose builds, connects, and starts all pieces simultaneously.

---

## 2. Docker Internal Networking & DNS

When you start Docker Compose, Docker automatically creates an isolated virtual bridge network (e.g. `backend_default`).

```
                     DOCKER VIRTUAL BRIDGE: "backend_default"
                     (Subnet: 172.20.0.0/16 | Internal DNS: 127.0.0.11)
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
   ┌──────────────────────┐                       ┌──────────────────────┐
   │ movie_booking_backend│                       │ movie_booking_db     │
   │ Internal IP: 172.20.0.3                      │ Internal IP: 172.20.0.2
   └──────────┬───────────┘                       └──────────┬───────────┘
              │                                               │
              └────────► Calls "postgres:5432" ───────────────┘
                         (Docker DNS translates "postgres" -> 172.20.0.2)
```

### Why We Use `postgres:5432` Instead of `localhost:5432`:
- Inside the backend container, `localhost` refers to **itself** (not Windows, and not the database container).
- Docker runs an embedded DNS server at `127.0.0.11`.
- Any container can talk to another container by simply using its **service name (`postgres`)** as the domain name!

---

## 3. Container Dependencies & Health Checks (`depends_on`)

In a real production architecture, the backend must NOT start until PostgreSQL is fully initialized and accepting SQL queries.

```yaml
services:
  postgres:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d movie_booking"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    depends_on:
      postgres:
        condition: service_healthy # 👈 Waits for pg_isready to pass!
```

---

## 4. Secure `.env` Variable Injection

**Rule:** NEVER bake `.env` files into a Docker image via `COPY .env ./`. If you push that image to a registry, your secret keys are exposed to the public.

### How Docker Compose Safely Injects Secrets:
Docker Compose automatically reads `.env` on your host machine and injects the variables into the containers at runtime:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-admin}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password123}
  DATABASE_URL: postgres://${POSTGRES_USER:-admin}:${POSTGRES_PASSWORD:-password123}@postgres:5432/${POSTGRES_DB:-movie_booking}
  JWT_SECRET: ${JWT_SECRET}
  BREVO_API_KEY: ${BREVO_API_KEY}
```

- `${VAR:-default}` $\rightarrow$ Uses value from `.env`, but falls back to `default` if `.env` is missing.
- `${VAR}` $\rightarrow$ Strictly requires `VAR` to be present in `.env`.

---

## 5. Docker Compose CLI Commands Cheat Sheet

```bash
# 1. Build images and start all containers in detached/background mode
docker compose up --build -d

# 2. View live streaming logs from ALL containers
docker compose logs -f

# 3. View live streaming logs from ONLY the backend service
docker compose logs -f backend

# 4. View status of all services (Up, Exit, Port Mappings)
docker compose ps

# 5. Stop all containers (keeps volume data safe)
docker compose stop

# 6. Stop and remove containers and networks (keeps volume data safe)
docker compose down

# 7. Complete Nuclear Reset: Stop and DELETE containers, networks, AND named volumes
docker compose down -v
```
