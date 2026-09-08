# Nginx & Production Web Architecture

> **Topic:** How Modern Web Applications Are Served, Single-Page Application (SPA) Routing, Static Asset Caching, Development vs. Production Reverse Proxying (Vite vs. Nginx), and Browser DevTools Debugging.

---

## 1. The Fundamental Reality: How Every Website on Earth is Served

When you write code in React, you create a complex directory of `.jsx` components, CSS files, hooks, and Node packages. 

**Web browsers (Chrome, Edge, Safari, Firefox) cannot read any of that.**
* Browsers **cannot** execute JSX (`<MovieCard title={movie.title} />`).
* Browsers **cannot** import modules from `node_modules`.
* **Browsers only understand 3 things:** Plain HTML, Plain CSS, and Plain JavaScript.

```text
WHAT YOU WRITE (Development)                WHAT THE BROWSER ACTUALLY RECEIVES
┌──────────────────────────────┐            ┌──────────────────────────────┐
│ src/                         │            │ dist/                        │
│ ├── components/              │            │ ├── index.html               │
│ │   ├── MovieCard.jsx        │  npm run   │ └── assets/                  │
│ │   └── SeatMap.jsx          ├───────────►│     ├── index-D7h2k9.js      │
│ ├── App.jsx                  │   build    │     └── index-B1x8q2.css     │
│ └── main.jsx                 │            │                              │
└──────────────────────────────┘            └──────────────────────────────┘
```

### What `npm run build` Actually Does:
1. **Compiles JSX into Vanilla JavaScript:** Converts every `<tag>` into standard `React.createElement()` JavaScript functions.
2. **Minifies & Bundles:** Strips comments, shrinks variable names, and combines dozens of files into single, optimized bundles inside the `dist/` folder.
3. **Node.js is Completely Discarded:** Once the `dist/` folder is generated, **you do not need Node.js to run your frontend.** It is literally just flat files sitting on a hard drive!

---

## 2. Real-World Walkthrough: What Happens When You Type `netlify.com` in Your Browser?

Here is the exact networking reality of what happens when a user types a website address:

```text
[ USER'S BROWSER ]                                  [ PRODUCTION SERVER ]
       │                                                       │
       │ 1. Connects to Port 80 (http://netlify.com)           │
       ├──────────────────────────────────────────────────────►│ (Nginx listens on Port 80)
       │ 2. Sends HTTP 301 Redirect: "Upgrade to HTTPS!"       │
       │◄──────────────────────────────────────────────────────┤
       │                                                       │
       │ 3. Reconnects to Port 443 (https://netlify.com)       │
       ├──────────────────────────────────────────────────────►│ (Nginx performs SSL Handshake)
       │                                                       │ Nginx reads dist/index.html
       │ 4. Transmits index.html raw text across the internet  │ off the server's hard drive
       │◄──────────────────────────────────────────────────────┤
       │                                                       │
       │ (Browser reads index.html, discovers:                 │
       │  <script src="/assets/index-D7h2k9.js">)              │
       │                                                       │
       │ 5. Requests /assets/index-D7h2k9.js                   │
       ├──────────────────────────────────────────────────────►│ Nginx reads .js from disk
       │ 6. Sends index-D7h2k9.js (with 1-year cache header)   │
       │◄──────────────────────────────────────────────────────┤
       │                                                       │
[ Browser executes the JavaScript! ]                           │
[ React mounts and paints the UI on screen! ]                  │
```

### Why Nginx Instead of Node.js?
* **Node.js:** A dynamic runtime containing the heavy V8 JavaScript engine. Consumes 100–200MB of RAM just to read static files from disk.
* **Nginx:** An ultra-optimized C web server. Consumes only **~15MB of RAM** and an image size of only **~25MB** (`nginx:alpine`). It hands files from disk to the network socket at hardware speed.

---

## 3. The Proxy Evolution: Development (Vite) vs. Production (Nginx)

When your React code makes an API request (`axios.get('/api/movies')`), how does that request reach Express?

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. DEVELOPMENT: Vite Proxy Interception                     │
│                                                             │
│   Browser (localhost:5173)                                  │
│     │ GET /api/movies                                       │
│     ▼                                                       │
│   [ Vite Dev Server: Port 5173 ]                            │
│     │ (vite.config.js proxy rules intercept '/api')         │
│     ▼                                                       │
│   [ Express Backend: Port 5000 ]                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. PRODUCTION: Nginx Reverse Proxy Interception             │
│                                                             │
│   Browser (localhost:8081)                                  │
│     │ GET /api/movies                                       │
│     ▼                                                       │
│   [ Nginx Container: Port 80 ]                              │
│     │ (nginx.conf location /api/ proxy_pass rule)           │
│     ▼ (Private Docker Network)                              │
│   [ Express Container: Port 5000 ]                          │
└─────────────────────────────────────────────────────────────┘
```

### Why Reverse Proxying Beats Direct CORS Calls:
1. **Physically Eliminates CORS:** Both the HTML webpage and the `/api/` endpoints share the identical origin (`http://localhost:8081`). The browser never evaluates Cross-Origin policies!
2. **Hides Backend Ports:** Express on port 5000 and PostgreSQL on port 5432 are **never exposed to the internet**. Only Nginx's port 80/8081 is open.

### Dissecting the Nginx Proxy Forwarding Headers:
```nginx
location /api/ {
    proxy_pass http://backend:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
* **`proxy_pass http://backend:5000;`**: Forwards requests to the `backend` container using internal Docker DNS.
* **`proxy_set_header X-Real-IP $remote_addr;`**: Without this header, Express would think **every single user on the internet** has Nginx's internal container IP address (`172.18.0.x`)! This preserves the user's real public IP address.
* **`proxy_set_header Host $host;`**: Preserves the original domain name the user typed into their browser.

---

## 4. The Single-Page Application (SPA) Routing Problem (`try_files`)

### How React Client Routing Works:
When a user clicks "My Bookings" inside the React app:
* The browser does **not** send a network request to the server.
* React's JavaScript intercepts the click, updates the URL bar to `/my-bookings` using the browser's `history.pushState()`, and swaps the component on screen.

### The Problem When a User Hits Refresh (F5) or Bookmarks the URL:
1. Because the user refreshed, the browser sends a real network request across the internet to Nginx:
   > *"Give me the file located at `/my-bookings`."*
2. Without configuration, Nginx looks on the hard drive for a file or folder named `/my-bookings`.
3. Because all your code lives in `index.html` and `dist/`, that folder does not exist! Nginx returns a blank **`404 Not Found`**.

### The Solution: `try_files`
In `frontend/nginx.conf`:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
1. **`$uri`**: Checks if an exact physical file exists (e.g., `/assets/index-D7h2k9.js`). If yes, serves it immediately.
2. **`$uri/`**: Checks if an exact directory exists.
3. **`/index.html` (The Fallback)**: If neither exists, Nginx silently serves `/index.html`.
4. The browser boots up the React bundle, reads `/my-bookings` from the URL bar, and renders the correct component!

---

## 5. Static Asset Caching & HTTP 304 (Not Modified)

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

* **Vite Cache-Busting Hashes:** Notice compiled files are named `index-D7h2k9.js`. If you change your code, Vite generates a completely new hash (`index-X8k1p2.js`).
* **The First Visit (Cold Load):** The browser downloads the HTML, CSS, and 300KB JavaScript bundle across the internet (takes 1–2 seconds).
* **The Second Visit (Cached Load):** Because Nginx attached `Cache-Control: public, max-age=31536000` (1 year), Chrome checks its local laptop hard drive first. It loads the bundle in **5 milliseconds** without sending a network request!
* **What HTTP 304 Means:** If the browser sends an `If-None-Match` (ETag) request asking *"Did anything change?"*, Express responds with status **304** and an empty body (`body: []`). Chrome immediately reuses its locally cached data.

---

## 6. Browser DevTools: How to Debug Network & API Calls

### Opening DevTools Without `F12`:
On many laptops, `F12` controls brightness or volume unless you hold `Fn + F12`.
* **Method 1 (Universal):** Right-click anywhere on the webpage ➔ Click **"Inspect"**.
* **Method 2:** Press **`Ctrl + Shift + I`**.

### The 3 Essential Network Tab Settings:
1. **Open the `Network` tab.**
2. **Click the `Fetch/XHR` filter:** Hides all HTML, CSS, and image files so **only backend API calls** (`/api/...`) appear.
3. **Check `[x] Disable cache`:** Forces Chrome to make real network requests instead of reusing old memory copies.
4. **Hard Reload (`Ctrl + F5`):** Reloads the page while DevTools actively records the traffic.
5. **Inspect Payloads & Responses:**
   * **Headers:** Request URL, HTTP Method (GET/POST), Status Code (200, 304, 500).
   * **Payload:** The JSON body your React frontend sent.
   * **Preview / Response:** The exact JSON data Express returned.
