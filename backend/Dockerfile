# backend/Dockerfile
FROM python:3.10-slim



COPY . /app
WORKDIR /app

# 2. Install compiler
RUN apt-get update && apt-get install -y g++

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Compile directly to the global system bin directory during build
RUN g++ -O3 -std=c++17 /app/scheduler.cpp -o /usr/local/bin/scheduler

EXPOSE 8000


# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]