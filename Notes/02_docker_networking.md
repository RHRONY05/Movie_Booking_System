# 02 — Docker Networking & Multi-Container Communication

> **Module 2 in Docker Series**  
> **Topic:** Docker Virtual Networks, Default vs. Custom Bridge Networks, Internal DNS Service Discovery, Network Isolation, and Multi-Tier Container Architecture.

---

## 1. What is a Docker Network?

When you run multiple containers on your computer, Docker does not leave them isolated from each other. Docker creates **virtual software switches (software-defined networks)** inside your operating system.

A Docker network allows containers to exchange data through virtual IP addresses without exposing those connections to your laptop's physical Wi-Fi or local network.

---

## 2. The 3 Default Docker Networks

Whenever Docker is installed, it comes with 3 built-in networks out of the box (`docker network ls`):

| Network | Driver | How It Works | Use Case |
|---|---|---|---|
| **`bridge`** | `bridge` | The default virtual network. Containers receive a private IP (e.g. `172.17.0.2`). | Default for standalone `docker run` commands. |
| **`host`** | `host` | Removes network isolation between container and host machine. The container directly uses your laptop's real IP and ports. | Maximum network performance (skips Docker NAT). |
| **`none`** | `null` | Disables all networking. Container has no network card, no IP, and zero connectivity. | Ultra-secure batch computation (crypto, offline jobs). |

---

## 3. Network Name vs. Network Driver (`driver: bridge`)

A common question is: *"What is the difference between the network name and `bridge`?"*

* **The Driver (`bridge`)**: The **underlying technology / mechanism**. A bridge driver acts like a virtual Ethernet switch inside your computer that connects multiple virtual network cards together.
* **The Network Name (`movie_network`)**: The **specific private instance** you create.

```text
┌────────────────────────────────────────────────────────────┐
│ DOCKER ENGINE                                              │
│                                                            │
│  [ BRIDGE DRIVER (The Virtual Switch Technology) ]         │
│         ├── Custom Network 1: "movie_network"              │
│         │     ├── frontend (172.20.0.2)                    │
│         │     ├── backend  (172.20.0.3)                    │
│         │     └── postgres (172.20.0.4)                    │
│         │                                                  │
│         └── Custom Network 2: "billing_network"            │
│               └── payment_service (172.21.0.2)             │
└────────────────────────────────────────────────────────────┘
```

Containers inside `movie_network` can talk to each other freely, but containers in `billing_network` are completely blocked from reaching them!

---

## 4. Default Bridge vs. User-Defined Custom Bridge (The DNS Superpower)

Why do we always create a **custom network** in Docker Compose instead of using Docker's default `bridge`?

### The Critical Difference: Internal DNS & Service Discovery
1. **The Default `bridge` Network (No DNS):**
   * Containers can only talk to each other by **hardcoded IP addresses** (`172.17.0.2`).
   * Because Docker re-assigns IP addresses randomly every time containers reboot, hardcoded IPs break immediately!
2. **User-Defined Custom Bridge (`movie_network`):**
   * **Automatic Service Discovery via Internal DNS!**
   * Docker runs an embedded DNS server at IP `127.0.0.11`.
   * Any container can reach another container simply by typing its **service name** (e.g. `http://backend:5000` or `postgres:5432`). Docker translates the name into the correct dynamic IP on the fly!

```text
               DOCKER CUSTOM BRIDGE: "movie_network"
               (Embedded DNS Server at 127.0.0.11)
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌──────────────────────┐                       ┌──────────────────────┐
│ backend              │                       │ postgres             │
│ Internal IP: 172.20.0.3                      │ Internal IP: 172.20.0.2
└──────────┬───────────┘                       └──────────┬───────────┘
           │                                               │
           └────────► Connects to "postgres:5432" ─────────┘
                      (Docker DNS automatically translates
                       "postgres" -> 172.20.0.2)
```

---

## 5. Multi-Tier Network Isolation (The "Zero-Trust" Pattern)

In advanced production setups, you can define multiple networks to isolate frontend from database:

```text
[ Public Internet ]
        │ (Port 8081)
        ▼
┌─────────────────┐
│ frontend (Nginx)│
└───────┬─────────┘
        │ (frontend_net)
        ▼
┌─────────────────┐
│ backend (API)   │
└───────┬─────────┘
        │ (backend_net)
        ▼
┌─────────────────┐
│ postgres (DB)   │
└─────────────────┘
```

* `frontend` is only in `frontend_net`. It **cannot physically talk to `postgres`**, even if someone hacks into Nginx!
* `backend` is connected to both `frontend_net` and `backend_net`.
* `postgres` is only in `backend_net`. It is completely shielded from public-facing tiers.

---

## 6. Docker Network CLI Cheat Sheet

```bash
# 1. List all active Docker networks
docker network ls

# 2. Inspect a network (shows all connected containers, their IPs and MAC addresses)
docker network inspect movie_booking_system_movie_network

# 3. Create a manual custom bridge network
docker network create my_custom_net

# 4. Connect a running container to a network
docker network connect my_custom_net container_name

# 5. Disconnect a container from a network
docker network disconnect my_custom_net container_name

# 6. Delete an unused network
docker network rm my_custom_net
```
