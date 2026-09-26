# Future Project Blueprint: High-Throughput Distributed Systems & Scale Lab

> **Status:** Planned / Locked In for Post-Movie-Booking Study  
> **Target Timeline:** level break of 3rd year 
> **Core Disciplines:** System Design, Computer Networks, Advanced DevOps  

---

## 🎯 Executive Summary & Purpose

Most software developers only know how to build applications that run on `localhost` for 1 user. 

This project is a **dedicated hands-on laboratory** designed to explore the limits of hardware, network protocols, and distributed architecture. Instead of just writing code, the focus is on:
1. **Intentionally pushing a server to its breaking point** using automated load-testing tools.
2. **Diagnosing bottlenecks** in real time (CPU vs. RAM vs. Database Connection Pool).
3. **Applying architectural solutions** (Caching, Load Balancing, Virtual Hosts, Rate Limiting) to scale the system from 50 RPS to 2,000+ RPS on cheap, low-spec hardware.

---

## 📚 Core Topics & Knowledge Domains

### 1. Computer Networks & Protocol Fundamentals
- [ ] **HTTP Request Anatomy & The `Host` Header:** How web clients communicate which domain they want over a single IP.
- [ ] **Virtual Hosts / Server Blocks (Nginx):** Hosting multiple distinct websites (`app1.domain.com`, `app2.domain.com`, `portfolio.domain.com`) on one single Linux VPS.
- [ ] **TCP/IP Handshakes & Port Multiplexing:** How operating systems route connections to sockets without collision.
- [ ] **Reverse Proxy Architecture:** Terminating SSL at the edge and proxying traffic to internal non-public ports.

### 2. Performance Engineering & Capacity Estimation
- [ ] **Capacity Planning Math:** Calculating theoretical RPS based on endpoint execution latency:
  $$\text{RPS} = \frac{\text{CPU Cores} \times 1000\text{ ms}}{\text{Average Latency (ms)}}$$
- [ ] **Simulating Real-World Traffic:** Writing automated stress-test scripts with **`k6`**, **`Autocannon`**, or **`Artillery`**.
- [ ] **Latency Percentiles:** Measuring **P50**, **P95**, and **P99** response times under extreme concurrent load (1,000 to 5,000 virtual users).
- [ ] **Live Hardware Diagnostics:** Inspecting CPU spikes, RAM exhaustion, and I/O wait times using `htop`, `vmstat`, and `docker stats`.

### 3. Caching & In-Memory Data Stores (Redis)
- [ ] **The Database Bottleneck:** Why relational disk queries fail when thousands of users read identical data simultaneously.
- [ ] **Cache-Aside Pattern:** Checking Redis first, falling back to PostgreSQL, and writing back to cache.
- [ ] **Cache Invalidation & TTL (Time To Live):** Preventing stale data without overwhelming the database.
- [ ] **Performance Benchmarking:** Comparing response times before and after caching (e.g. 800ms ➔ 12ms).

### 4. Horizontal Scaling & Load Balancing
- [ ] **Vertical vs. Horizontal Scaling:** Knowing when to pay for a bigger machine vs. adding more server instances.
- [ ] **Multi-Container Replicas:** Running multiple stateless backend containers on the same host using Docker Compose:
  ```bash
  docker compose up -d --scale backend=3
  ```
- [ ] **Nginx Upstream Load Balancing:** Configuring balancing algorithms:
  - **Round-Robin** (Default sequential distribution)
  - **Least Connections** (Directing traffic to the least busy container)
  - **IP Hash** (Sticky sessions for persistent connections)
- [ ] **Stateless Backend Architecture:** Storing session state in Redis or JWTs so any container can handle any user request.

### 5. System Protection & Traffic Shaping (Rate Limiting)
- [ ] **DDoS & Abuse Prevention:** Implementing IP-based and user-based rate limiters (e.g., maximum 100 requests per minute per IP).
- [ ] **Token Bucket & Leaky Bucket Algorithms:** Controlling burst traffic gracefully without dropping legitimate users.
- [ ] **Database Connection Pooling:** Using connection pool managers (like `PgBouncer`) to prevent PostgreSQL from rejecting spikes in traffic.

### 6. Observability & Monitoring
- [ ] **Application Metrics:** Visualizing real-time request rates, error codes (4xx/5xx), and latencies using Prometheus & Grafana.
- [ ] **Alerting Thresholds:** Configuring automated email/Slack alerts when server CPU exceeds 85% or available memory drops below 10%.

---

## 🛠️ Proposed Step-by-Step Build Phases

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Baseline Application & Stress Testing                             │
│  - Create a lightweight Express / Fastify / Go API with 10,000 dummy rows.   │
│  - Run k6 script: ramp from 10 to 1,000 concurrent users over 2 minutes.     │
│  - Document the exact point of failure (OOM crash or connection timeout).   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 2: In-Memory Caching Layer (Redis)                                    │
│  - Add Redis container. Cache the heaviest read endpoint.                   │
│  - Re-run k6 benchmark. Compare before vs. after graphs.                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 3: Multi-Instance Load Balancing                                     │
│  - Scale backend to 3 replicas in Docker.                                    │
│  - Configure Nginx 'upstream' pool to balance traffic.                       │
│  - Kill 1 container mid-test and verify zero downtime (High Availability).  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 4: Multi-Domain Single-Server Hosting                                 │
│  - Point 2 different subdomains to the same VPS IP.                         │
│  - Configure Nginx virtual hosts to route each domain to different apps.    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 5: Rate Limiting & Protection                                        │
│  - Implement Redis-backed token bucket rate limiter.                        │
│  - Prove that aggressive scripts get throttled with HTTP 429 Too Many Req.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💼 Why This Will Supercharge Your Career & 4th Year

1. **Academic Dominance:** Makes final-year university courses in *Distributed Systems*, *Cloud Computing*, and *Computer Networks* trivial and intuitive.
2. **Top 1% Portfolio Piece:** While classmates show static web apps, you will have benchmark reports, load-testing graphs, and real architectural war stories.
3. **Interview Goldmine:** Gives you deep, confident answers to any Senior/System Design interview questions about scaling, caching, concurrency, and reliability.
