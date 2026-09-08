# -------------------------------------------------------------------
# STAGE 1: Install Production Dependencies (The Builder)
# -------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install ONLY production dependencies cleanly
RUN npm ci --omit=dev

# -------------------------------------------------------------------
# STAGE 2: Minimal Production Runner (Hardened & Non-Root)
# -------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package manifest, application code, and migrations
COPY package*.json ./
COPY src ./src
COPY migrations ./migrations

# Security Hardening: Ensure the non-root 'node' user owns the app directory
RUN chown -R node:node /app

# Switch from 'root' to the unprivileged 'node' user
USER node

# Document the listening port
EXPOSE 5000

# Start the Express server
CMD ["node", "src/server.js"]
