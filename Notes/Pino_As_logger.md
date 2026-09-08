# Industry-Standard Logging in Node.js

This document serves as a quick revision guide on how we implemented a production-ready logging system for our Express application.

## The Tools We Used

Instead of using the standard (and slow) `console.log`, we used a suite of tools from the **Pino** ecosystem. Pino is known for being extremely fast and for outputting structured JSON data.

1. **`pino`**: The core logging engine. It generates the actual log messages in a structured JSON format.
2. **`pino-http`**: An Express middleware. It automatically intercepts incoming HTTP requests, calculates response times, and automatically logs the request/response cycle without us having to write `logger.info()` in every route.
3. **`pino-pretty`**: A development tool (transport). Raw JSON logs are hard for humans to read. `pino-pretty` takes that JSON and formats it into colorful, readable text in our terminal while we code.
4. **`pino-roll`**: A production tool (transport). It takes our JSON logs and writes them to a file (e.g., `logs/app.1.log`). It automatically "rotates" these files (creating a new one daily or when it hits 10MB) so our server's hard drive doesn't fill up.

## The Logging Lifecycle (How it works)

When a user makes a request (like `GET /health`), here is exactly what happens:

1. **Interception**: The request hits the `pino-http` middleware first (because we put it at the top of `app.js`).
2. **Waiting Game**: `pino-http` records the start time, assigns a unique `req.id`, but **does not log yet**. It calls `next()` to let Express do its routing.
3. **The Response**: The request reaches our route handler (`res.status(200).json(...)`) and the data is sent to the user.
4. **The Trigger**: Node.js fires a hidden `finish` event on the response object.
5. **The Log Creation**: `pino-http` wakes back up, calculates the `responseTime`, determines the log level (e.g., `info` for 200 OK, `error` for 500s), and passes this data to the `pino` engine.
6. **The Transports**: The `pino` engine forwards the final JSON to our Transports:
   - `pino-pretty` prints it to our terminal.
   - `pino-roll` saves it to our `logs/` directory.

## Custom Serializers (Security & Optimization)

By default, `pino-http` logs *everything*, including all HTTP headers. 
This is dangerous in production because:
* It wastes massive amounts of disk space.
* It leaks sensitive data like Authentication cookies or JWTs.

To fix this, we used **custom serializers** in `logger.js`. A serializer is just a function that intercepts the object before it gets logged, allowing us to pick and choose exactly which fields to keep. We configured ours to only keep the `method`, `url`, `id`, and `statusCode`, stripping out all the noisy headers!
