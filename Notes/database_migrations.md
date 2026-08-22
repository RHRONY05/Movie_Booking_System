# Database Migrations

Migrations are version control for your database. Just like Git tracks changes to your code, migrations track changes to your database schema over time.

## 1. Why Timestamps?
Migration files always start with a Unix timestamp (e.g., `1787331883988_init-schema.js`). **command :- npm run migrate create init-schema**
When multiple developers are creating tables simultaneously, the timestamps ensure that the database engine runs the files in the exact chronological order they were created. This prevents conflicts where a table might try to reference another table that hasn't been built yet.

## 2. NPM Script Mapping
Instead of typing the long command `npx node-pg-migrate up` every time, we mapped it in our `package.json`:
```json
"scripts": {
  "migrate": "node-pg-migrate"
}
```
This allows us to simply run `npm run migrate up` or `npm run migrate create [name]`.

## 3. How the Code Works
We use Javascript to write our migrations because the `node-pg-migrate` tool provides a helper object called `pgm` (Postgres Migration Builder). The `pgm` object translates our Javascript directly into raw PostgreSQL statements.

Every migration file has two core functions:

*   **`exports.up` (The "Do" Action):** 
    This contains the instructions for moving the database *forward*. When you run `npm run migrate up`, it reads this block to create tables, add columns, or insert data.
*   **`exports.down` (The "Undo" Action):** 
    This acts as a safety net. It contains the exact opposite instructions (e.g., dropping the tables you just created). If you make a mistake, running `npm run migrate down` will perfectly revert the database to its previous state.

## 4. The Magic of `.env` Auto-loading
Normally, when connecting a Node.js server to a database, you write explicit code to read environment variables and establish a connection. 
However, `node-pg-migrate` has a built-in feature: it automatically looks for a `.env` file in the directory it runs from. If it finds a variable exactly named `DATABASE_URL`, it silently parses it and uses it to connect to the database (e.g., passing through the `5432` tunnel Docker created). This is why we didn't have to write any connection code for the migrations to work!
