# 01 — Docker Core Concepts & CLI Cheat Sheet

> **Module 1 in Docker Series**  
> **Topic:** Container Anatomy, Host Hardware Sharing, Namespaces & Cgroups, Images vs. Containers, Port Mapping (`-p Host:Container`), Container Ephemerality, and Essential CLI Commands.

---

## 1. What is a Container? (The Mental Model)

A Docker container is **NOT a Virtual Machine (VM)**:
* A **Virtual Machine** simulates fake hardware (virtual CPU, RAM, BIOS) and runs a heavy guest OS (takes gigabytes of RAM).
* A **Docker Container** is an ordinary, lightweight Linux process running **directly on your host machine's physical hardware**.

```text
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
1. **Namespaces:** Creates a virtual wall so the container only sees its own processes (PID), its own network interface, and its own filesystem mounts.
2. **Cgroups (Control Groups):** Limits how much physical CPU/RAM the container is allowed to consume.

---

## 2. Image vs. Container

| Concept | What It Is | Real-World Analogy |
|---|---|---|
| **Docker Image** | A frozen, read-only package containing OS files, Node runtime, and application code. | The architectural blueprint |
| **Docker Container** | A live, running process instance of an image in memory. | The actual physical building constructed from the blueprint |

---

## 3. Port Mapping (`-p Host:Container`)

Containers are sandboxed. By default, ports opened inside a container cannot be reached from your Windows browser.

```text
 WINDOWS HOST (Browser)                           CONTAINER
 ┌───────────────────┐     Port Forwarding       ┌───────────────────┐
 │ localhost:5000    ├──────────────────────────►│ Port 5000         │
 └───────────────────┘    (-p 5000:5000)         │ (Express Server)  │
                                                 └───────────────────┘
```

* **Syntax:** `-p <Host Port>:<Container Port>` (e.g. `5000:5000` or `8081:80`).
* **Host Port (Left):** The door you visit on Windows (`http://localhost:5000`).
* **Container Port (Right):** The internal port where Express, Nginx, or PostgreSQL is listening.
* **`EXPOSE 5000` (in Dockerfile):** Pure documentation metadata for developers. It does **not** open ports on Windows by itself.
* **Host Binding (`0.0.0.0`):** Inside a container, servers must listen on `0.0.0.0` (all network interfaces) so Docker's bridge can route traffic to it.

---

## 4. Container Ephemerality (Why Containers Don't Persist Data)

Containers are **immutable and disposable**:
* When a container writes or updates a file (like PostgreSQL inserting rows or an app generating logs), those changes are written to a thin, temporary read/write layer.
* **If the container is removed (`docker rm`), that temporary layer is permanently deleted.**
* In modern container architecture, persistent data (like databases) is never stored strictly inside the container filesystem; it is mounted externally via Volumes (covered in detail in `04_docker_compose.md`).

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

# Check which user is executing commands inside the container
docker run --rm <image_name> whoami
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
