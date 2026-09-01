# Database Transactions, Connection Pooling, & Pessimistic Locking

This document covers the core concepts used to solve concurrency and race conditions in the Movie Booking System.

## 1. Connection Pooling (`pool` vs `client`)

When connecting a Node.js server to PostgreSQL, we don't want to open and close a brand new connection for every single user request (that is very slow). Instead, we use a **Connection Pool**.

*   **The Pool (`pool`)**: Think of it as a bucket of reusable, open phone lines to the database (e.g., 10 concurrent connections).
*   **`pool.query()` (Quick Access)**: 
    *   **How it works:** Node grabs a random available phone line, shouts a single SQL query, and instantly hangs up.
    *   **Use case:** Simple reads (`SELECT`) or single writes (`INSERT`) where you only need to run ONE query.
*   **`client = await pool.connect()` (Dedicated Access)**:
    *   **How it works:** Node checks out a specific, dedicated phone line from the pool. No other request can use this line until you explicitly "hang up" by calling `client.release()`.
    *   **Use case:** Required for **Transactions**, where you need to run *multiple* queries sequentially on the exact same connection state.

---

## 2. Database Transactions

A **Transaction** groups multiple SQL queries into a single, indivisible unit of work. It follows the rule of **Atomicity** ("All or Nothing"). 

If we reserve a seat but our server crashes before we can insert the booking record, we would have a "ghost seat" that is reserved forever but owned by no one. Transactions prevent this.

### The Transaction Flow
1.  **`BEGIN`**: Tells the database to create a temporary, invisible workspace. Any `UPDATE` or `INSERT` made here is only visible to the current `client`. Other users reading the database will still see the old data.
2.  **`COMMIT`**: If all queries succeed without errors, we tell the database to "Save". The temporary workspace is permanently applied to the real database for everyone to see.
3.  **`ROLLBACK`**: If *anything* goes wrong (e.g., a query fails, or our business logic throws an error), we tell the database to "Don't Save". The temporary workspace is thrown in the trash, and it's as if none of the queries ever happened.

# ACID Properties of Transaction
Transactions in DBMS must ensure data is accurate and reliable. They follow four key ACID properties:

`Atomicity`: A transaction is fully completed or fully rolled back.
`Consistency`: Maintains the database in a valid state after a transaction.
`Isolation`: Transactions execute independently without interfering with each other.
`Durability`: Committed changes remain permanent, even after a system failure.

---

## 3. Pessimistic Locking (`SELECT ... FOR UPDATE`)

To prevent Race Conditions (e.g., 100 users trying to book the exact same seat at the exact same millisecond), we use a **Pessimistic Lock**.

*   **The Problem:** Without a lock, 100 concurrent requests will all run `SELECT status FROM seats`, all see that the seat is `AVAILABLE`, and all proceed to update it to `RESERVED`. We just oversold 1 seat to 100 people.
*   **The Solution:** We change our query to `SELECT status FROM seats WHERE id = $1 FOR UPDATE`.
*   **How it works (Row-Level Locking):**
    1.  Request #1 runs the `FOR UPDATE` query. PostgreSQL places a lock on that specific row in the database.
    2.  Requests #2 through #100 also try to run the `FOR UPDATE` query. However, PostgreSQL forces them to pause and wait in a queue because Request #1 holds the lock.
    3.  Request #1 finishes its work and runs `COMMIT`. The lock is released.
    4.  PostgreSQL hands the lock to Request #2. Request #2 finally reads the row, but now the status is `RESERVED`! Request #2 triggers our business logic error, runs `ROLLBACK`, and fails gracefully.
    5.  This process guarantees that only 1 person can ever successfully book the seat.


