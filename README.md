# 🚅 IR-ABPS: High-Frequency Railway Maintenance Execution Engine

[![C++17](https://img.shields.io/badge/C++-17-blue.svg)](https://isocpp.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

**Smart India Hackathon 2026 Solution (SIH26027)**

IR-ABPS (Automatic Block Planning System) is a low-latency, algorithmic scheduling engine designed to solve the complex constraints of railway infrastructure maintenance. By treating track availability as quantitative "time liquidity," this system schedules massive backlogs (10,000+ tasks) across a 60-day horizon with minute-level precision, mathematically guaranteeing zero overlap with live train traffic.

---

## 🧠 The Architecture: Overcoming the "Liquid Time Fallacy"

Standard optimization models (like 1D Dynamic Programming Knapsacks) pool daily track availability into total hours. However, physical maintenance requires strictly contiguous time blocks. A model that packs a 4-hour task into two disjointed 2-hour gaps will mathematically succeed on paper, but physically result in a train collision.

### Priority-Weighted Interval Matching (PWIM)
This engine Abandons rigid $O(N \cdot W)$ DP arrays in favor of a quantitative interval-matching approach:
1. **Physical Gap Extraction:** The engine sweeps chronologically sorted train timetables to extract contiguous safe track intervals, applying strict dynamic safety buffers.
2. **Risk-Weighted Max Heap:** Tasks are prioritized via a custom heuristic evaluating defect severity, overdue status, and execution duration.
3. **$O(N \log N)$ Interval Matching:** The C++ core utilizes `std::priority_queue` for order routing and Red-Black Trees (`std::multiset`) for $O(\log G)$ Best-Fit gap matching, processing multi-month horizons in milliseconds.

---

## 🛠️ Tech Stack

* **Execution Engine (C++):** Bare-metal algorithmic core compiled with `-O3` optimization for maximum loop vectorization and execution speed.
* **Backend Gateway (Python / FastAPI):** Asynchronous WebSocket router that bridges the frontend UI to the compiled C++ binary.
* **Frontend (React / Tailwind):** Features a high-performance, virtualized "liquid glass" Gantt chart capable of rendering thousands of minute-bound intervals without frame drops.
* **Infrastructure:** Fully containerized via Docker for isolated binary compilation and seamless cross-platform deployment.

---

## 🚀 Local Setup & Docker Deployment

The backend and C++ execution engine are fully containerized. Docker ensures the C++ binary is securely compiled in a Linux environment with the correct aggressive optimization flags (`-O3`) before the WebSocket server boots up.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* Node.js (v18+) for the frontend.

### Step 1: Deploy the Backend (Docker)
Clone the repository and navigate to the backend directory:
```bash
git clone https://github.com/Mayobhav-Pathak/SIH-2026_SIH26027.git
cd SIH-2026_SIH26027
```
Build and spin up the Docker container. This will automatically compile scheduler.cpp and start the FastAPI WebSocket server:
```bash
docker-compose up --build -d
```
The backend is now actively listening for WebSocket connections on ws://localhost:8000/ws/optimize-stream.
### Step 2: Run the Frontend
Open a new terminal window, navigate to the frontend directory, and start the React development server:
```bash
cd ../frontend
npm install
npm run dev
```
### Step 3: Execute a Schedule
* 1.Open your browser to http://localhost:5173/ (usually)
* 2.Upload your timetable.json and backlog.json datasets.
* 3.Adjust the Safety Buffer parameters.
* 4.Click Execute Schedule to stream the JSON payloads to the C++ engine and watch the Gantt chart render in real-time.
### 📊 Performance Metrics
* **Time Complexity**: $O(N \log N + N \log G)$
* **Memory Footprint**: Highly optimized; relies on self-balancing BSTs rather than multi-dimensional DP arrays.
* **Temporal Resolution**: 1-minute intervals (1440 mins/day).

Built for SIH 2026.

