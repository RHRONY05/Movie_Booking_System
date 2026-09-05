# 1. Base Image: Use lightweight Node 20 on Alpine Linux
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package manifests first (leverages Docker layer caching)
COPY package*.json ./

# 4. Install production dependencies only
RUN npm ci --omit=dev

# 5. Copy the application source code and migrations
COPY src ./src
COPY migrations ./migrations

# 6. Expose the port our Express server listens on
EXPOSE 5000

# 7. Define the startup command to launch the server
CMD ["node", "src/server.js"]
