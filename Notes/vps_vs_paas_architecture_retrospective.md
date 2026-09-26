# DevOps Retrospective & Architecture Comparison: Self-Hosted VPS vs. Managed PaaS

This document records the foundational architectural analysis comparing our two production deployment tracks built during Phase 7 of the Movie Booking System.

---

## 1. Executive Summary

| Dimension | Track A: Self-Hosted Linux VPS (Azure Ubuntu) | Track B: Decoupled Managed PaaS (Vercel + Render + Neon) |
| :--- | :--- | :--- |
| **Architecture Topology** | Monolithic container network (`docker-compose.prod.yml`) | Decoupled serverless micro-services across global providers |
| **Traffic Ingress** | Nginx Reverse Proxy (SSL termination, `/` static, `/api` proxy) | Global Edge CDN (Vercel Anycast) + Render Gateway |
| **Networking & Latency** | Internal Docker bridge (`< 0.1ms` inter-service latency) | TLS over Public Internet (Cross-cloud network transit) |
| **Operational Burden** | High — OS patching, UFW, Certbot SSL renewals, Swap, disk care | Near Zero — Fully managed infrastructure and automated deployments |
| **Scaling Strategy** | Vertical first (Resize VM vCPU/RAM; requires downtime) | Elastic horizontal autoscaling (Zero cold-boot on Edge CDN) |
| **Cost Dynamics** | Flat, predictable ($10–$30/mo flat rate regardless of load) | Free/cheap for low traffic; scales steeply with bandwidth/compute |
| **Security Surface Area** | High DIY surface (SSH keys, open ports, Docker socket, CVEs) | Shared responsibility (Cloud handles OS/Network; dev handles secrets) |

---

## 2. Deep-Dive Topology Comparison

### Track A: The All-in-One Containerized VPS Model
```
User Browser (HTTPS rhrony05.me:443)
       │
       ▼
 [ Linux Host / UFW Firewall (Ports 22, 80, 443) ]
       │
       ▼
┌──────┼──────────────────────────────────────────────┐
│ Docker Private Bridge Network (`app-network`)       │
│      │                                              │
│      ▼                                              │
│  [ Nginx Container (Port 80/443 SSL termination) ]  │
│      ├── / ─────────► [ Vite Static Files on Disk ] │
│      └── /api ──────► [ Node.js Backend Container ] │
│                              │                      │
│                              ▼                      │
│                       [ PostgreSQL DB Container ]   │
│                              │                      │
│                              ▼                      │
│                       [ Docker Named Volume (SSD) ] │
└─────────────────────────────────────────────────────┘
```

#### Key Characteristics:
* **Colocation:** Nginx, Node.js Express, and PostgreSQL live on the exact same physical SSD and RAM.
* **Internal Routing:** Express connects to PostgreSQL at `db:5432` via Docker DNS resolution. Database traffic never touches the public internet.
* **Single Point of Failure (SPOF):** If the host operating system crashes or runs out of memory, all application services go offline simultaneously.

---

### Track B: Decoupled Multi-Cloud Micro-Services Model
```
User Browser
    │
    ├──────── (1) Load HTML/JS/CSS ────────► [ Vercel Edge CDN ]
    │                                         (Replicated across ~300 global edge locations)
    │
    └──────── (2) REST API Calls (/api/*) ─► [ Render Web Service ]
                                              (Containerized Node.js in Frankfurt/Oregon)
                                                   │
                                                   │ (TLS / Internet egress)
                                                   ▼
                                             [ Neon Serverless PostgreSQL ]
                                              (Compute separated from S3 storage engine)
```

#### Key Characteristics:
* **Geographic Distribution:** Static assets are served from the user's nearest physical internet exchange point (~10ms TTFB).
* **Fault Isolation:** If Render experiences an outage, Vercel continues serving the React application smoothly with graceful UI offline/error notifications.
* **Network Overhead:** Express connects to Neon via a public secure connection (`ep-cool-cloud.us-east-2.aws.neon.tech`). Queries cross datacenter boundaries, requiring pooled connections.

---

## 3. Operational Maintenance: "Who Wakes Up at 3 AM?"

### Self-Hosted VPS Maintenance Checklist:
1. **OS Vulnerability Management:** Regular `apt update && apt upgrade` to patch Linux kernel and OpenSSL CVEs.
2. **Log & Storage Management:** Rotating Docker daemon logs (`/var/lib/docker/containers`) and application logs (`pino-roll`) to prevent disk exhaustion.
3. **SSL Certificate Lifecycle:** Monitoring Let's Encrypt / Certbot cron jobs to prevent expiration and HTTPS trust errors.
4. **Database Integrity:** Scripting and validating automated `pg_dump` backups, pruning backups older than 7 days, and testing disaster recovery restores.

### Managed PaaS Maintenance Checklist:
1. **Application Code & Secrets Only:** Platform handles OS patching, container orchestration, SSL renewal, and database hardware maintenance automatically.
2. **Automated Rollbacks & Point-in-Time Recovery:** Instant 1-click redeployments to earlier Git commits and Neon database branching.

---

## 4. Cost Economics & Inflection Points

```
Monthly Cost ($)
  ▲
  │                                      / (PaaS: Usage scales exponentially)
  │                                     /
  │                                    /
  │              INFLECTION POINT     /
  │                     ★───────────-
  │                    /             ═════════ (VPS: Predictable flat hardware cost)
  │                   /
  │  (PaaS is Free / /
  │   or Cheap)     /
  └─────────────────┴────────────────────────► Traffic & Compute Scale
```

* **Phase 1 (MVP / Low Traffic):** PaaS is vastly cheaper. Generous free tiers on Vercel and Neon allow zero infrastructure cost while eliminating costly DevOps developer hours.
* **Phase 2 (Scale / High Bandwidth):** VPS is vastly cheaper. PaaS bandwidth charges ($0.15–$0.40/GB) and RAM scaling markups quickly exceed the flat $20–$80/month cost of a high-performance VPS or bare-metal server.

---

## 5. Security & The Shared Responsibility Model

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SHARED RESPONSIBILITY PYRAMID                     │
├────────────────────────────┬────────────────────┬──────────────────────┤
│ Layer                      │ Self-Hosted VPS    │ Managed PaaS         │
├────────────────────────────┼────────────────────┼──────────────────────┤
│ Application Code & Secrets │ YOU                │ YOU                  │
│ Cross-Origin CORS / Auth   │ YOU                │ YOU                  │
│ Reverse Proxy & SSL Ciphers│ YOU (Nginx config) │ CLOUD PLATFORM       │
│ Firewall & Port Access     │ YOU (UFW & SG)     │ CLOUD PLATFORM       │
│ Container Runtime / Docker │ YOU (daemon/cgroups│ CLOUD PLATFORM       │
│ Linux OS & Kernel CVEs     │ YOU (apt / kernel) │ CLOUD PLATFORM       │
│ Physical Server Hardware   │ AZURE / CLOUD HOST │ CLOUD PLATFORM       │
└────────────────────────────┴────────────────────┴──────────────────────┘
```

* **VPS Hardening Required:**
  - Restricting public ports using UFW (`ufw default deny incoming`, opening only 22, 80, 443).
  - Enforcing non-root container privileges (`USER node`).
  - Protecting SSH private keys (`chmod 400` / `icacls`) and disabling password authentication.
* **PaaS Security Defaults:**
  - Automated edge DDoS mitigation and TLS termination.
  - Zero open inbound container ports (only public HTTP/HTTPS gateways exposed).

---

## 6. Industry Decision Guide

Use this decision matrix when planning future software projects:

* **Choose Managed PaaS When:**
  - Speed-to-market is the primary objective.
  - The team has no dedicated infrastructure/DevOps engineers.
  - Traffic is variable or unpredictable (benefits from auto-scaling to zero).
  - Building prototypes, hackathons, or customer-facing MVPs.

* **Choose Self-Hosted VPS When:**
  - Budget predictability is paramount (fixed hardware allowance).
  - Traffic and resource demands are predictable and sustained.
  - Application handles high-volume file transfers or streaming (avoiding cloud bandwidth markup).
  - Regulatory or privacy policies require complete physical/data isolation.
