# Code Quality Linters: Oxlint, ESLint & React Rules

> **Topic:** The 4 Layers of Frontend Code Quality (Compilers, Type Checkers, Formatters, Linters), Rust-Based Linter Performance (Oxlint), and Core React Rules.

---

## 1. The 4 Layers of Frontend Code Quality

When writing modern JavaScript and React, different tools protect you at different stages:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. COMPILER (Vite / Babel / SWC / esbuild)                                  │
│    - Job: Translates modern JSX, ES6+ into browser-compatible JavaScript.   │
│    - Speed: Instant (runs during dev and build).                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. TYPE CHECKER (TypeScript / tsc)                                          │
│    - Job: Validates data contracts and function signatures.                 │
│    - Example: Throws an error if you pass a String to a function needing Number.
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. FORMATTER (Prettier / Biome)                                             │
│    - Job: Pure aesthetics (tabs vs spaces, semicolons, line wrapping).       │
│    - Does NOT care if your code has bugs; only cares that it looks uniform.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. LINTER (ESLint / Oxlint)                                                 │
│    - Job: Catches logical bugs, security risks, dead code, and React violations.
│    - Analyzes the Abstract Syntax Tree (AST) to find bad programming patterns.
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Next-Gen Linter: Oxlint vs. ESLint

For years, **ESLint** has been the industry standard for JavaScript. However, because ESLint is written in JavaScript, running it across large codebases is notoriously slow.

### What is Oxlint?
* **Oxlint** is a next-generation linter written from scratch in **Rust**.
* **50x to 100x Faster:** Uses all available CPU cores in parallel and parses code in native machine instructions.
* Zero configuration needed for React out of the box.

```bash
# Run Oxlint across the frontend
npx oxlint
```

---

## 3. Essential React Linting Rules Explained

In [`frontend/.oxlintrc.json`](file:///d:/Projects/Movie_Booking_System/frontend/.oxlintrc.json), we configure these two critical React rules:

```json
{
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ]
  }
}
```

### Rule 1: `react/rules-of-hooks: "error"`
* **The Law:** React Hooks (`useState`, `useEffect`, `useContext`, `useMemo`) must **ONLY** be called at the top level of a function component.
* **Why:** React does not store Hook values by variable name. It stores them in an **ordered internal array** indexed by the order they execute on render.
* **The Bug:** If you call a hook inside an `if` statement or a loop:
  ```javascript
  // ❌ ILLEGAL:
  if (isLoggedIn) {
    const [theme, setTheme] = useState('dark'); // Corrupts Hook order!
  }
  ```
  On renders where `isLoggedIn` is false, all subsequent hooks read the wrong index from the array, causing catastrophic state corruption.

### Rule 2: `react/only-export-components: "warn"`
* **The Law:** Files containing React components should **only export components** (or constants).
* **The Bug:** If you export arbitrary utility functions, objects, or classes from the same file as a React component:
  ```javascript
  // ❌ Breaks Fast Refresh:
  export const calculatePrice = (qty) => qty * 10;
  export default function SeatMap() { ... }
  ```
  Vite's **Fast Refresh (Hot Module Replacement)** cannot determine if editing `calculatePrice` requires a component re-render or a full page reload. It is forced to perform a destructive full page reload, wiping out your current component state.
