# Frontend Architecture: Vite Proxy, CORS & Code Quality Linters

This guide explains two essential full-stack concepts:
1. **API Communication Patterns (Direct CORS vs. Reverse Proxy)**
2. **Code Quality Layers (Compilers vs. Linters vs. Type Checkers)**

---

## Part 1: API Communication — Direct CORS vs. Reverse Proxy

When building a full-stack application with a separate frontend (e.g., Vite/React on port `5173`) and backend (e.g., Express on port `5000`), there are two primary ways to make API requests:

```
Pattern A: Direct Cross-Origin API Requests (CORS-dependent)
Pattern B: Same-Origin Relative Paths via Reverse Proxy (Proxy-managed)
```

---

### Pattern A: Direct API Calls + Backend CORS

#### How It Works:
1. The frontend injects an environment variable pointing to the backend:
   ```javascript
   const API_BASE = import.meta.env.VITE_BACKEND_URL; // "http://localhost:5000"
   fetch(`${API_BASE}/api/movies`);
   ```
2. The browser makes a direct network call to `http://localhost:5000`.
3. Because `localhost:5173` and `localhost:5000` have different ports, the browser treats this as a **Cross-Origin** request.
4. The browser sends an `Origin: http://localhost:5173` header.
5. The backend must explicitly whitelist that origin using CORS middleware:
   ```javascript
   app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
   ```

#### Diagram:
```text
Browser (Origin: http://localhost:5173)
   │
   │  Direct Cross-Origin Request (GET http://localhost:5000/api/movies)
   ▼
Express Backend (localhost:5000)
   │  Returns header: Access-Control-Allow-Origin: http://localhost:5173
   ▼
Browser validates header and permits JavaScript to read the data.
```

---

### Pattern B: Same-Origin Relative Paths + Reverse Proxy

#### How It Works:
1. The frontend does **not** hardcode a backend URL. It uses a clean relative path:
   ```javascript
   fetch('/api/movies');
   ```
2. The browser sends the request to `http://localhost:5173/api/movies` (the origin the page was loaded from).
3. Because the domain and port match, the browser considers it **Same-Origin**. **No browser CORS checks are triggered.**
4. The Vite Dev Server intercepts any request starting with `/api` and forwards it server-to-server to port `5000`.
5. Express responds to Vite, and Vite returns the response to the browser.

#### Diagram:
```text
Browser (Origin: http://localhost:5173)
   │
   │  Same-Origin Request (GET http://localhost:5173/api/movies)
   ▼
Vite Dev Server (localhost:5173)
   │  Intercepts "/api" route
   │  Proxies request under the hood to http://localhost:5000/api/movies
   ▼
Express Backend (localhost:5000)
   │  Responds to Vite
   ▼
Vite returns response to Browser (as if 5173 generated it)
```

#### Vite Configuration (`vite.config.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Destination backend
        changeOrigin: true,               // Rewrites Host header to match backend
        secure: false,                    // Allows self-signed SSL/HTTP targets
      },
    },
  },
});
```

---

### Why Industry & DevOps Favor Pattern B (Reverse Proxy)

| Benefit | Explanation |
| :--- | :--- |
| **1. `httpOnly` Cookie Reliability** | Modern browsers (Safari ITP, Chrome Privacy Sandbox) restrict or block cookies sent across different ports/origins (treating them as 3rd-party tracking cookies). Relative paths make all cookies **first-party**, ensuring authentication sessions never drop. |
| **2. Zero Preflight `OPTIONS` Overhead** | Cross-origin requests with custom headers (e.g. `Authorization`) or non-GET methods require an extra preflight `OPTIONS` request before sending the actual data. Same-origin proxy requests skip this delay entirely. |
| **3. Clean Environment Portability** | No backend URLs or ports are baked into the client bundle. The same frontend code works in development, staging, and production without rebuilding. |
| **4. Direct Match with Production (Nginx)** | In production, Express is rarely exposed to the public internet. Instead, **Nginx** acts as the reverse proxy on port 80/443. Vite's proxy mirrors Nginx behavior locally during development. |

#### Comparison Summary:

| Feature | Pattern A: Direct + CORS | Pattern B: Reverse Proxy |
| :--- | :--- | :--- |
| **Frontend Call** | `fetch('${ENV_URL}/api/movies')` | `fetch('/api/movies')` |
| **Origin Category** | Cross-Origin (`5173` → `5000`) | Same-Origin (`5173` → `5173`) |
| **Browser CORS Check** | Strict check; fails without server headers | Bypassed naturally |
| **Preflight `OPTIONS` Requests** | Yes (extra network hop for complex requests) | No |
| **Dev Proxy Tool** | None | Vite Dev Server (`server.proxy`) |
| **Prod Proxy Tool** | Cloud DNS / direct domain | Nginx Reverse Proxy |

---

## Part 2: Code Quality Layers (Syntax vs. Linters vs. Types)

Developers often confuse compilers, linters, and type checkers. Each serves a distinct layer in code quality:

```text
Layer 1: Syntax / Compiler  → "Is this legal JavaScript syntax?"
Layer 2: Linter (ESLint/Oxlint) → "Is this legal, but bad practice, buggy, or messy?"
Layer 3: Type Checker (TypeScript) → "Are the data types and function contracts respected?"
```

---

### 1. Syntax Check / Compiler (Vite / Babel / SWC)
- **Role:** Checks if JavaScript engine can parse the code without crashing.
- **Example caught:** Missing closing parenthesis `const x = (5 + 2;`
- **Limitation:** Valid syntax can still contain catastrophic logical bugs.

### 2. Linters (ESLint & Oxlint)
- **Role:** Statically analyzes the code structure without executing it to enforce safety, performance, and best practices.
- **What they catch:**
  - Unused variables or imports (memory waste, dead code).
  - Unreachable code blocks (after a `return` statement).
  - Infinite `useEffect` dependency loops in React.
  - Calling React Hooks conditionally (violating React's internal call stack order).

#### Oxlint vs. ESLint:
- **ESLint:** Written in Node.js/JavaScript. Highly configurable with thousands of community plugins, but can be slow on large codebases.
- **Oxlint:** Written in **Rust**. Runs **50–100x faster** than ESLint with zero-config defaults. Designed for modern Vite/Turbopack tooling.

#### Understanding `.oxlintrc.json`:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ]
  }
}
```

- **`react/rules-of-hooks: "error"`**:
  Enforces that Hooks (`useState`, `useEffect`, etc.) are only called at the top level of React function components. Calling a hook inside an `if` statement or `for` loop corrupts React's internal state array and causes crashes.
- **`react/only-export-components: "warn"`**:
  Ensures that files containing React components only export components (or constants). Exporting other objects or helper functions from a component file breaks Vite's Fast Refresh (Hot Module Replacement), forcing full page reloads instead of instant updates.
