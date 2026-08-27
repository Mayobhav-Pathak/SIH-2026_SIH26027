# backend/Dockerfile
FROM python:3.10-slim

# Install the C++ compiler (g++)
RUN apt-get update && \
    apt-get install -y g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Compile directly to the global system bin directory during build
RUN g++ -O3 -o /usr/local/bin/scheduler scheduler.cpp

EXPOSE 8000

EXPOSE 8000

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]