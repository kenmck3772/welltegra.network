# Lightweight Python image for Cloud Run free tier
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (Docker layer caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Run with gunicorn (production WSGI server)
CMD exec gunicorn --bind :8080 --workers 1 --threads 2 --timeout 60 main:app
