# -------------------------------------------------------------------
# STAGE 1: Build the React application (The Builder)
# -------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy source code and compile JSX into production bundle (dist/)
COPY . .
RUN npm run build

# -------------------------------------------------------------------
# STAGE 2: Serve with lightweight Nginx (The Production Server)
# -------------------------------------------------------------------
FROM nginx:alpine

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the compiled static files from Stage 1 into Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Run Nginx in foreground so the Docker container remains active
CMD ["nginx", "-g", "daemon off;"]
