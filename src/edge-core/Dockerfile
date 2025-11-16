# WellTegra Edge Core - Dockerfile
# Lightweight containerized version for rig deployment
# Supports offline-first operation with Store-and-Forward sync

FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    postgresql-client \
    openssl \
    curl \
    bash

WORKDIR /app

# Copy package files
COPY edge-core/package*.json ./
COPY api/package*.json ./api/

# Install dependencies
RUN npm ci --production && \
    cd api && npm ci --production

# Copy application files
COPY edge-core/ ./edge-core/
COPY api/ ./api/
COPY assets/ ./assets/
COPY *.html ./
COPY equipment-catalog.json ./
COPY data-equipment-tools.csv ./
COPY tailwind.config.js ./
COPY styles/ ./styles/

# Copy nginx configuration for static file serving
COPY edge-core/nginx.conf /etc/nginx/nginx.conf

# Create directories for data persistence
RUN mkdir -p /data/queue /data/logs /data/sync

# Set environment variables
ENV NODE_ENV=production \
    EDGE_MODE=true \
    API_PORT=3001 \
    NGINX_PORT=8080 \
    DATABASE_URL=postgresql://edge:edge@postgres:5432/welltegra_edge

# Expose ports
EXPOSE 8080 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start script
COPY edge-core/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
