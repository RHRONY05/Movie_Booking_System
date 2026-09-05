# 03 — Dockerfiles, Layer Caching & Multi-Stage Builds

> **Module 3 of 3 in Docker Series**  
> **Topic:** Dockerfile Instructions, Build Layer Caching Optimization, Multi-Stage Builds, and `.dockerignore`.

---

## 1. Anatomy of a Production `Dockerfile`

A `Dockerfile` is a line-by-line script that packages your application into a self-contained image.

```dockerfile
# 1. Base Image: Minimal Alpine Linux with Node 20 (~180MB instead of 1GB)
FROM node:20-alpine

# 2. Set the working directory inside the Linux container
WORKDIR /app

# 3. Copy package manifests FIRST (Leverages Docker Layer Caching!)
COPY package*.json ./

# 4. Install production dependencies only (skip devDependencies like jest/supertest)
RUN npm ci --omit=dev

# 5. Copy the source code and database migrations
COPY src ./src
COPY migrations ./migrations

# 6. Documentation metadata: specifies which port the app listens on
EXPOSE 5000

# 7. The execution command when the container boots up
CMD ["node", "src/server.js"]
```

---

## 2. Docker Layer Caching (Why Order Matters)

Docker builds images in **cached layers** from top to bottom. If a layer hasn't changed, Docker skips rebuilding it.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. FROM node:20-alpine     ──► CACHED (Downloaded once from Docker Hub)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. WORKDIR /app            ──► CACHED (Instantly reused)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. COPY package*.json ./   ──► CACHED (Unless you installed a new npm package)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. RUN npm ci --omit=dev   ──► CACHED! (Skips 30s npm install if package.json│
│                                hasn't changed!)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. COPY src ./src          ──► REBUILDS in 0.1s when you edit your code!     │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **Rule:** ALWAYS copy `package.json` and run `npm install` **before** copying `src/`. If you copy `src/` first, every single code edit will invalidate the cache and force Docker to re-download all npm packages from scratch!

---

## 3. Two-Stage / Multi-Stage Build Concept

In modern frontend applications (like **React + Vite**) or compiled languages (Go, Rust, TypeScript):
- You need a heavy environment to compile/build your code (Node.js + devDependencies).
- But in production, you only want a tiny web server (like **Nginx**) to serve the static HTML/CSS/JS files!

```dockerfile
# ==========================================
# STAGE 1: The Builder Environment (Heavy)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build   # Produces optimized static files in /dist

# ==========================================
# STAGE 2: The Production Runtime (Tiny ~25MB)
# ==========================================
FROM nginx:alpine AS production
# Copy ONLY the compiled /dist folder from Stage 1 into Nginx web root!
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Why Multi-Stage Builds are Industry Standard:
1. **Tiny Image Size:** Image drops from ~1GB (Node.js + `node_modules` + source code) down to **~25MB** (pure Nginx + compiled HTML/JS).
2. **Maximum Security:** No build tools, source code, or compiler tools exist in the production container for hackers to exploit.

---

## 4. The `.dockerignore` File

Just like `.gitignore`, `.dockerignore` prevents unnecessary or sensitive files from being copied into the Docker image build context.

```
# .dockerignore
node_modules
logs
tests
coverage
.git
.gitignore
.env
npm-debug.log
```

- **Why ignore `node_modules`?** Because the container will install its own Linux-compatible dependencies via `npm ci`.
- **Why ignore `tests` and `.env`?** Keeps production images small and prevents leaking secret keys.
