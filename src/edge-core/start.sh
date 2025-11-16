#!/bin/bash
# WellTegra Edge Core - Startup Script
# Starts Nginx and Node.js API in parallel

set -e

echo "[Edge Core] Starting WellTegra Edge Core..."
echo "[Edge Core] Mode: EDGE (Offline-capable)"
echo "[Edge Core] API Port: ${API_PORT}"
echo "[Edge Core] Nginx Port: ${NGINX_PORT}"

# Wait for PostgreSQL to be ready
echo "[Edge Core] Waiting for PostgreSQL..."
until pg_isready -h postgres -U edge; do
  echo "[Edge Core] PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "[Edge Core] PostgreSQL is up"

# Wait for Kafka to be ready
echo "[Edge Core] Waiting for Kafka..."
until nc -z kafka 9092; do
  echo "[Edge Core] Kafka is unavailable - sleeping"
  sleep 2
done
echo "[Edge Core] Kafka is up"

# Start Node.js API in background
echo "[Edge Core] Starting Node.js API on port ${API_PORT}..."
cd /app/edge-core
node server.js &
API_PID=$!
echo "[Edge Core] API started with PID ${API_PID}"

# Start Nginx
echo "[Edge Core] Starting Nginx on port ${NGINX_PORT}..."
nginx -g 'daemon off;' &
NGINX_PID=$!
echo "[Edge Core] Nginx started with PID ${NGINX_PID}"

# Wait for both processes
wait -n $API_PID $NGINX_PID

# Exit with status of first process to exit
exit $?
