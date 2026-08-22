## August 21, 2026 Session Log
- **What was built:** Created the monorepo folder structure, set up a PostgreSQL database using Docker Compose, initialized a Node.js environment, and successfully executed our first database migration using `node-pg-migrate` to create the complete database schema (`users`, `movies`, `seats`, `bookings`, `otp_verifications`).
- **What was taught/learned:** Learned how Docker Compose handles networking and volumes to persist data. Learned why migrations use Unix timestamps (chronological ordering) and the concept of `exports.up` (Do) vs `exports.down` (Undo) for database version control.
- **Status/Pending:** Phase 1 is officially 100% complete! The database schema is ready.
- **Open Questions:** Think about how our Express server (which we will build next) will need to communicate with this database. We will need to learn how to route HTTP requests next!
