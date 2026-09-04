# Automated Backend Testing — Revision Notes
> Written during Phase 5 of the Movie Booking System project.  
> Revise this frequently. Knowing once is not enough to remember.

---

## 1. The Two Libraries and Their Roles

You always use **both together**. They do different jobs.

| Library | Role | Analogy |
|---|---|---|
| **Jest** | The test runner. Runs the test files, manages mocks, and reports pass/fail. | The judge in a courtroom |
| **Supertest** | Makes fake HTTP requests to your Express app without needing a real server running | The lawyer who presents evidence |

> **Key point:** Supertest does NOT start a server on a port. It imports your `app` object directly and injects HTTP requests **in-memory** inside the same Node.js process. This is why you never see logs in your dev server terminal — they appear in the `npm test` terminal instead.

---

## 2. `cross-env` — Why It's Needed

When you run `npm test`, Jest starts a fresh Node.js process. Environment variables (from your `.env` file) don't automatically transfer.

`cross-env` is a tool that injects environment variables into the child process in a way that works across **Windows, Mac, and Linux** without writing different shell scripts.

```json
"test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --runInBand"
```

- `NODE_OPTIONS=--experimental-vm-modules` → Enables Jest to understand ES6 `import/export` syntax (ESM).
- `--runInBand` → Runs all test files **one at a time** (important when tests share a database).

---

## 3. The AAA Pattern — How Every Test is Structured

Every single test in the world follows this 3-step mental model:

```
ARRANGE  →  ACT  →  ASSERT
```

| Step | What You Do |
|---|---|
| **Arrange** | Set up the state: clean the database, mock external APIs, prepare test data |
| **Act** | Do the thing you are testing: send the HTTP request via Supertest |
| **Assert** | Check the outcome: verify the status code, response body, and database changes |

```javascript
it('should create a booking', async () => {
  // ARRANGE
  await pool.query('INSERT INTO seats (id, ...) VALUES (...)');
  const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);

  // ACT
  const response = await request(app)
    .post('/api/bookings/initiate')
    .set('Authorization', `Bearer ${token}`)
    .send({ seatId: 1 });

  // ASSERT
  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Seat reserved. Please verify OTP.');
});
```

---

## 4. Types of Tests — What You CAN and CANNOT Automate

### ✅ What You CAN Test with Jest + Supertest

| Scenario | Example |
|---|---|
| Happy path (correct input → correct output) | Valid credentials → 200 + JWT |
| Missing/invalid input | No token in body → 400 |
| Auth/security checks | No JWT in header → 401 |
| Database mutations | After booking, row exists in `bookings` table |
| Concurrent requests (race conditions) | 20 simultaneous seat bookings → exactly 1 succeeds |
| Mocked external APIs | Google OAuth, Brevo email, Stripe payment |
| OTP expiry/timing logic | Insert expired OTP → verify → expect 400 |

### ❌ What You CANNOT Realistically Test with Jest + Supertest

| Limitation | Why |
|---|---|
| Real browser interactions (clicking buttons) | Supertest only speaks HTTP, not browser JS |
| Visual UI rendering (CSS, layout) | Requires a browser rendering engine |
| Real third-party API calls (Google, Stripe in live mode) | You always mock these to avoid cost/side-effects |
| Mobile app behavior | Needs device simulators (e.g., Detox for React Native) |
| Email actually arriving in inbox | You verify the API was *called*, not that the email landed |

> **For browser/UI testing**, separate tools exist: **Playwright**, **Cypress**, or **Selenium**.

---

## 5. Mocking — Replacing Real Things With Fake Ones

### Why Mock?

When your code calls an **external service** (Google, Brevo, Stripe), you do NOT want tests to:
- Make real network calls (slow, costs money, requires internet)
- Depend on external uptime
- Create real user accounts in production

So you **intercept** the call and replace it with a fake that returns what you control.

### How It Works Under the Hood (Monkey Patching)

JavaScript objects and their methods are stored in memory. A method on a class prototype is just **a pointer to a function** in memory.

```
BEFORE jest.spyOn:
OAuth2Client.prototype.verifyIdToken  →  [Real Google Function]

AFTER jest.spyOn:
OAuth2Client.prototype.verifyIdToken  →  [Jest Mock Wrapper]
                                              ↓
                                   (original saved internally)
```

`jest.spyOn` swaps the real function for a mock wrapper **at the same location** in the prototype. When your controller runs `client.verifyIdToken(...)`, JavaScript looks up the prototype chain and finds the **mock** instead of the real function — without the controller knowing anything changed.

This works because in Node.js, **all `import`s from the same module share the same prototype object in memory**. The test file and the controller both import `OAuth2Client` — they point to the same prototype, so swapping it in one place affects both.

> This technique is called **Monkey Patching**. Jest automates and safely cleans it up with `jest.spyOn()` and `.mockRestore()`.

### Key Mocking Methods

```javascript
// Replace a method temporarily (restores after test)
jest.spyOn(SomeClass.prototype, 'methodName');

// Tell mock what to return for the NEXT call only
spy.mockResolvedValueOnce({ ... });   // for async/promise success
spy.mockRejectedValueOnce(new Error('fail'));  // for async/promise failure

// Tell mock what to return for ALL future calls
spy.mockResolvedValue({ ... });

// Replace global.fetch with a fake
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ message: 'mocked' }),
});

// Restore the original function
spy.mockRestore();
```

---

## 6. Test Organization: `describe`, `it`, `beforeAll`, `afterAll`

```javascript
describe('POST /api/auth/google', () => {    // Group related tests
  
  beforeAll(async () => {                    // Runs ONCE before the group
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    verifyIdTokenSpy = jest.spyOn(OAuth2Client.prototype, 'verifyIdToken');
  });

  afterAll(async () => {                     // Runs ONCE after the group (cleanup)
    verifyIdTokenSpy.mockRestore();
    await pool.end();
  });

  it('should return 200 on valid token', async () => { ... });     // individual test
  it('should return 400 if token missing', async () => { ... });  // individual test
  it('should return 401 if Google rejects', async () => { ... }); // individual test
});
```

> **Why clean the database before tests?** Because if a previous test run crashed mid-way, leftover data could cause the next run to fail unpredictably. Always start from a known clean state.

---

## 7. The Four Scenario Categories Every Endpoint Should Cover

When you sit down to write tests for ANY endpoint, ask yourself these 4 questions:

| # | Question | Expected Response |
|---|---|---|
| 1 | **Happy Path** — What happens when everything is correct? | 200/201 + correct data |
| 2 | **Validation Errors** — What if required fields are missing or invalid? | 400 Bad Request |
| 3 | **Auth/Security** — What if the user has no token, expired token, or wrong role? | 401/403 |
| 4 | **State/Conflict** — What if the resource already exists or is in the wrong state? | 409 Conflict / 400 |

### Real Examples From This Project

| Test File | Endpoint | Scenarios Covered |
|---|---|---|
| `health.test.js` | `GET /health` | Happy path only (server is up) |
| `auth.test.js` | `POST /api/auth/google` | Valid token (200), missing token (400), Google rejection (401) |
| `auth.test.js` | `GET /api/auth/me` | Valid JWT (200), no header (401), fake/tampered JWT (401) |
| `booking.concurrency.test.js` | `POST /api/bookings/initiate` | Race condition: 20 concurrent requests → exactly 1 wins (200), rest lose (409) |
| `booking.verify.test.js` | `POST /api/bookings/verify` | Correct OTP (200), wrong OTP (400), expired OTP (400), missing fields (400) |

---

## 8. Testing Databases — Development vs Production

### In Development (your case now)
- Tests **delete and re-insert** data freely. This is fine because it's isolated test data.
- You point Jest at a **separate test database** (or use the same dev DB with cleanup).
- Rule: **Never run destructive tests against a production database.**

### In Production — How Real Companies Handle It
- Tests run in **CI/CD pipelines** (e.g., GitHub Actions) triggered automatically on every `git push`.
- The CI pipeline spins up a **fresh, temporary database** (a Docker container) just for the test run — it gets destroyed afterward.
- This means tests are always isolated. Production data is **never touched**.
- **Three database environments are standard:**
  1. `development` — your local machine
  2. `staging/test` — a mirror of production, used for CI/CD testing
  3. `production` — real users, never touched by automated tests

### When Are Tests Run in Production-Grade Workflows?
```
Developer writes code
        ↓
git push to GitHub
        ↓
GitHub Actions triggers automatically
        ↓
Spins up Docker (fresh DB + app)
        ↓
Runs npm test (all test suites)
        ↓
If ALL pass → code is safe to deploy
If ANY fail → deployment is BLOCKED
```

> **Key insight:** Automated tests are not just for development. They are the **gatekeeper that decides whether new code is safe to ship to real users.**

---

## 9. What `--runInBand` Means

By default, Jest runs test files in parallel (multiple at once). This is faster, but if multiple test files share the same database, they can interfere with each other.

`--runInBand` forces Jest to run test files **sequentially, one after the other**, in a single process. This is the safe option when you have a shared database.

---

## 10. Quick Reference Cheat Sheet

```
jest.spyOn(Class.prototype, 'method')  →  intercept method calls
.mockResolvedValueOnce({...})          →  fake a successful async return
.mockRejectedValueOnce(new Error())    →  fake a failed async throw
.mockRestore()                         →  put the real function back

request(app).get('/route')             →  fake GET request (no port needed)
request(app).post('/route').send({})   →  fake POST with body
.set('Authorization', 'Bearer <tok>')  →  add auth header to request

expect(res.status).toBe(200)           →  check HTTP status code
expect(res.body.field).toBe('value')   →  check response JSON
expect(res.body.field).toBeDefined()   →  check field exists
```
