# Dark Kenneth Triad - Dockerfile
# Multi-stage build for production deployment

FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Development stage
FROM base AS development

# Install dev dependencies
RUN pip install pytest pytest-cov black flake8 mypy

# Copy project files
COPY pyproject.toml ./
COPY src/ ./src/
COPY tests/ ./tests/

# Install package in development mode
RUN pip install -e .

# Set default command
CMD ["pytest", "tests/", "-v", "--cov=src"]

# Production stage
FROM base AS production

# Copy project files
COPY pyproject.toml ./
COPY src/ ./src/

# Install package and dependencies
RUN pip install -e .

# Create non-root user
RUN useradd -m -u 1000 triad && \
    chown -R triad:triad /app
USER triad

# Expose port for web interface
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Set default command
CMD ["python", "-m", "my_agent.agent"]

# Web interface stage
FROM base AS web

# Install serving dependencies
RUN pip install aiohttp aiohttp-cors

# Copy project files
COPY pyproject.toml ./
COPY src/ ./src/
COPY web/ ./web/

# Install package
RUN pip install -e .

# Create non-root user
RUN useradd -m -u 1000 triad && \
    chown -R triad:triad /app
USER triad

EXPOSE 8000

# Copy web server script
COPY docker/web-server.py ./

CMD ["python", "docker/web-server.py"]
