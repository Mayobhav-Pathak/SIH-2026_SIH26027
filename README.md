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
*   **Backend API:** Python, FastAPI
*   **Frontend UI:** React, Tailwind CSS, Lucide Icons
*   **Deployment:** Docker (Containerized Microservices)


