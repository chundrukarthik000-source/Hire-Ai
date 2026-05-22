# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy and install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY app/ ./app/

# Cloud Run injects PORT env variable (default 8080)
# The app reads HOST and PORT from env
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose the port (documentation only - Cloud Run uses PORT env var)
EXPOSE 8080

# Start the FastAPI server with uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
