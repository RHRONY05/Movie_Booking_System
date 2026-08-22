# Docker Basics: Compose, Services, and Volumes

When working with modern web applications, Docker is the industry standard for ensuring that software runs exactly the same way on your laptop as it does on a production server. Here is a breakdown of the core concepts we are using in our project.

## 1. What is Docker Compose?
If Docker is an engine that runs isolated applications (called "containers"), **Docker Compose** is the conductor of the orchestra. 

Instead of typing long, complicated terminal commands every time you want to start a database or a server, Docker Compose allows you to write all the rules in a simple text file (`docker-compose.yml`). With a single command (`docker-compose up`), Compose reads the file and builds, connects, and starts all the pieces of your application at once.

## 2. What are "Services"?
In the `docker-compose.yml` file, a **Service** represents one piece of your application architecture. 

For example, our Movie Booking System will eventually have multiple services:
*   A `postgres` service (the database).
*   A `backend` service (our Node/Express API).
*   A `frontend` service (our React app).

By declaring them as separate services, Docker runs them in their own isolated containers, but automatically connects them to the same internal network so they can talk to each other securely.

## 3. What are "Volumes"?
By default, Docker containers are **ephemeral** (temporary). If you delete a container, everything inside it—including all the data in your database—is permanently erased.

A **Volume** is Docker's solution to data persistence. 
*   It acts like a virtual USB drive that you plug into a container. 
*   When our `postgres` container saves a new movie booking, it writes that data directly onto the Volume (`pgdata`).
*   If the database container crashes or you delete it, the `pgdata` Volume remains safely stored on your hard drive. When you start a new database container and plug that same Volume back in, all your data is instantly restored.
