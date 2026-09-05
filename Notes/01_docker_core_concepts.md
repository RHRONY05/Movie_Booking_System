# 01 — Docker Core Concepts, Storage & CLI Cheat Sheet

> **Module 1 of 3 in Docker Series**  
> **Topic:** Container Anatomy, Host Hardware Sharing, Port Mapping, Storage Types & Essential Commands.

---

## 1. What is a Container? (The Mental Model)

A Docker container is **NOT a Virtual Machine (VM)**:
- A **Virtual Machine** simulates fake hardware (virtual CPU, RAM, BIOS) and runs a heavy guest OS (takes gigabytes of RAM).
- A **Docker Container** is an ordinary, lightweight Linux process running **directly on your host machine's physical hardware**.

```
                      YOUR PHYSICAL COMPUTER HARDWARE
   ┌───────────────────────────────────────────────────────────────────┐
   │ Physical CPU  │  Physical RAM  │  Physical SSD  │  Physical Network│
   └───────┬───────────────┬───────────────┬────────────────┬──────────┘
           │               │               │                │
           ▼               ▼               ▼                ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │                     WINDOWS / HOST OPERATING SYSTEM               │
   │                     (Docker Engine / WSL2 Linux Kernel)           │
   └───────┬────────────────────────────────────────────────┬──────────┘
           │ Linux Namespaces (Virtual Walls)               │
           ▼                                                ▼
 ┌───────────────────────────┐                    ┌───────────────────────────┐
 │ CONTAINER 1 (Backend)     │                    │ CONTAINER 2 (Postgres DB) │
 │ - Shares Host CPU & RAM   │                    │ - Shares Host CPU & RAM   │
 │ - Has its own Virtual IP  │                    │ - Has its own Virtual IP  │
 └───────────────────────────┘                    └───────────────────────────┘
```

### The Two Isolation Mechanisms:
1. **Namespaces:** Creates a virtual wall so the container only sees its own processes (PID), its own filesystem mount points, and its own virtual network card.
2. **Cgroups (Control Groups):** Limits how much CPU/RAM the container is allowed to consume.

---

## 2. Image vs. Container

| Concept | What It Is | Analogy |
|---|---|---|
| **Docker Image** | A frozen, read-only package containing OS files, Node runtime, and application code. | The architectural blueprint / baked cake recipe |
| **Docker Container** | A live, running process instance of an image in memory. | The actual house built from the blueprint / the cake being eaten |

---

## 3. Port Mapping & Network Bridging (`-p Host:Container`)

Containers are sandboxed. By default, ports opened inside a container cannot be reached from your Windows browser.

```
 WINDOWS HOST (Browser)                           CONTAINER
 ┌───────────────────┐     Port Forwarding       ┌───────────────────┐
 │ localhost:5000    ├──────────────────────────►│ Port 5000         │
 └───────────────────┘    (-p 5000:5000)         │ (Express Server)  │
                                                 └───────────────────┘
```

- **Syntax:** `-p <Host Port>:<Container Port>` (e.g. `5000:5000` or `3000:5173`)
- **Host Port (Left):** The port you visit on Windows (`http://localhost:5000`).
- **Container Port (Right):** The internal port where Express or PostgreSQL is listening.
- **`EXPOSE 5000` (in Dockerfile):** Purely documentation/metadata. It tells developers which port is used, but **does not** open ports on Windows by itself.
- **Host Binding (`0.0.0.0`):** Inside a container, your server MUST listen on `0.0.0.0` (all network interfaces) so Docker's bridge can route traffic to it.

---

## 4. Container Storage: Named Volumes vs. Bind Mounts

Containers are **ephemeral** (temporary). If a container is deleted, all files written strictly inside it are permanently destroyed.

Docker provides two ways to persist data:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. NAMED VOLUMES (For Databases)                                            │
│    - Managed entirely by Docker inside its internal storage engine.         │
│    - Syntax: `volumes: - pgdata:/var/lib/postgresql/data`                   │
│    - Requires top-level `volumes: pgdata:` declaration.                     │
│    - High performance for database reads/writes on SSD.                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. BIND MOUNTS (For Code & Logs)                                            │
│    - A direct link to a folder that ALREADY exists on your Windows machine. │
│    - Syntax: `volumes: - ./logs:/app/logs`                                  │
│    - Does NOT require top-level `volumes:` declaration.                     │
│    - When container writes to `/app/logs`, it immediately appears in your   │
│      physical `backend/logs` folder on Windows!                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Essential Docker CLI Commands Cheat Sheet

### Managing Containers
```bash
# List running containers
docker ps

# List ALL containers (including stopped ones)
docker ps -a

# Stop a running container
docker stop <container_name_or_id>

# Start a stopped container
docker start <container_name_or_id>

# Remove a stopped container
docker rm <container_name_or_id>

# Force stop and remove a running container
docker rm -f <container_name_or_id>
```

### Inspecting & Debugging
```bash
# View live streaming logs from a container
docker logs -f <container_name>

# Open an interactive Bash/Sh terminal inside a running container
docker exec -it <container_name> sh

# Inspect container details (IP address, mounts, environment variables)
docker inspect <container_name>
```

### Managing Images
```bash
# List all downloaded/built images
docker images

# Remove an image from disk
docker rmi <image_name_or_id>

# Prune unused images and clean up disk space
docker image prune -a
```
