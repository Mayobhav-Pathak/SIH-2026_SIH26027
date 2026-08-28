# SIH-2026_SIH26027
# IR-ABPS: Automatic Block Planning System 🚆

An enterprise-grade, low-latency scheduling engine designed to optimize railway maintenance blocks using Machine Learning and C++ Dynamic Programming.

## System Architecture

The architecture is built for high-throughput data ingestion and real-time algorithmic execution across 15 simultaneous railway corridors.

*   **Frontend (React/Vite):** A dark-themed, highly optimized control dashboard featuring interactive Gantt charts, global state management, and real-time KPI scorecards.
*   **Gateway (Python/FastAPI):** An asynchronous API layer that ingests JSON schedules and utilizes a Random Forest heuristic to assign criticality scores to pending maintenance tasks.
*   **Optimization Engine (C++):** A contiguous memory (flat-buffer) knapsack solver that ingests the weighted tasks and spatial-temporal timetables to compute the mathematically optimal maintenance schedule in milliseconds.

## Key Features

*   **Algorithmic Prioritization:** Dynamically ranks tasks based on defect severity, traffic density, and asset age.
*   **Low-Latency Rescheduling:** Includes an "Emergency Injection" module that bypasses standard queues and triggers an instant C++ engine recalculation for critical rail fractures.
*   **Quantitative Scorecard:** Real-time KPI tracking for knapsack packing efficiency, total safe corridor throughput, and critical backlog clearance.
*   **Scalable Ingestion:** Handles stacked multi-file data pipelines for massive, nationwide JSON datasets.

## Tech Stack

*   **Core Engine:** C++17
*   **Backend API:** C++17, WebSockets
*   **Frontend UI:** React, Vite, Tailwind CSS
*   **Deployment:** Containerized via Docker with volume mounts ensuring strict dependency management and isolated cross-platform compilation of the C++ binaries.
### Local Deployment (Docker)
The architecture is containerized for zero-configuration deployment. Compiling the C++ engine from source is heavily optimized; even on standard development hardware like an IdeaPad i5, the build executes in seconds due to the lightweight 1D DP memory footprint.

```bash
# Clone the repository
git clone [https://github.com/Mayobhav-Pathak/SIH-2026_SIH26027](https://github.com/Mayobhav-Pathak/SIH-2026_SIH26027)
cd IR-ABPS-Dashboard

# Build and launch the containerized backend and frontend
docker-compose up --build

# The quantitative dashboard will stream live at:
# http://localhost:5173


