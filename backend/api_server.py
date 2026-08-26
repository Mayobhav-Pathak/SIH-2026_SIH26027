from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import numpy as np
import subprocess
import os

app = FastAPI(title="Indian Railways Block Planning Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
model = joblib.load("railway_criticality_model.pkl")

class MaintenanceTaskInput(BaseModel):
    id: str
    department: str
    section_id: str
    duration_hrs: int
    defect_severity: int
    days_overdue: int
    traffic_density_gmt: float
    asset_age_years: float

# NEW: Raw Train Schedule Input
class TrainScheduleInput(BaseModel):
    train_id: str
    section_id: str
    day_id: int
    entry_hour: int # 0 to 24
    exit_hour: int  # 0 to 24
    is_freight: bool

class BlockPlanningRequest(BaseModel):
    timetable: List[TrainScheduleInput]
    tasks: List[MaintenanceTaskInput]
    safety_buffer_mins: int  # Dynamic UI Slider

@app.post("/api/optimize-blocks")
def optimize_block_schedule(payload: BlockPlanningRequest):
    if not payload.tasks or not payload.timetable:
        return {"status": "empty", "schedule": None}

    # 1. Algorithmic Gap Finder with EXACT Time Mapping
    section_day_map = {}
    for train in payload.timetable:
        section_day_map.setdefault((train.section_id, train.day_id), []).append(train)

    corridors = []
    corridor_meta = {}
    c_idx = 0
    for (sec, day), trains in section_day_map.items():
        trains.sort(key=lambda x: x.entry_hour)
        freight_density = sum(1 for t in trains if t.is_freight) / max(1, len(trains))
        
        prev_exit = 0
        for tr in trains:
            # Convert the raw hour gap into minutes
            raw_gap_mins = (tr.entry_hour - prev_exit) * 60
            safe_capacity_mins = raw_gap_mins - payload.safety_buffer_mins
            
            if safe_capacity_mins > 0:
                corridors.append({"sec": sec, "c_idx": c_idx, "cap": safe_capacity_mins, "freight": freight_density})
                corridor_meta[str(c_idx)] = {"day": day, "start": prev_exit, "end": tr.entry_hour, "safe_cap_mins": safe_capacity_mins}
                c_idx += 1
            prev_exit = max(prev_exit, tr.exit_hour)
            
        final_gap_mins = (24 - prev_exit) * 60
        safe_capacity_mins = final_gap_mins - payload.safety_buffer_mins
        if safe_capacity_mins > 0:
            corridors.append({"sec": sec, "c_idx": c_idx, "cap": safe_capacity_mins, "freight": freight_density})
            corridor_meta[str(c_idx)] = {"day": day, "start": prev_exit, "end": 24, "safe_cap_mins": safe_capacity_mins}
            c_idx += 1

    # 2. Machine Learning: Predict Criticality
    feature_matrix = np.array([[t.defect_severity, t.days_overdue, t.traffic_density_gmt, t.asset_age_years] for t in payload.tasks])
    predicted_criticalities = model.predict(feature_matrix)

    enriched_tasks = []
    for i, t in enumerate(payload.tasks):
        enriched_tasks.append({
            "id": t.id,
            "section_id": t.section_id,
            "department": t.department,
            "duration_mins": t.duration_hrs * 60, # Scale weight to minutes for C++
            "duration_hrs": t.duration_hrs,       # Keep original for frontend display
            "priority_score": round(float(predicted_criticalities[i]) * (1 + (t.days_overdue * 0.2)), 2)
        })

    # 3. Prepare data for C++ Engine (Passing c_idx instead of day_id)
    cpp_input = f"{len(corridors)} {len(enriched_tasks)}\n"
    for c in corridors:
        cpp_input += f"{c['sec']} {c['c_idx']} {c['cap']} {c['freight']}\n"
    for t in enriched_tasks:
        # Pass duration_mins as the knapsack weight
        cpp_input += f"{t['duration_mins']} {t['priority_score']} {t['id']} {t['section_id']}\n"

    # 4. Execute C++ Binary
    executable = "./scheduler.exe" if os.name == 'nt' else "./scheduler"
    try:
        process = subprocess.Popen([executable], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(input=cpp_input)
    except FileNotFoundError:
        return {"status": "error", "message": "C++ executable not found."}

    # 5. Parse C++ Output and Inject Exact Windows
    parsed_output = stdout.strip().split()
    horizon_schedule = {str(i): [] for i in range(30)} 
    
    for item in parsed_output:
        if ":" in item:
            try:
                tid, returned_c_idx = item.split(":")
                task_data = next((t for t in enriched_tasks if t["id"] == tid), None)
                
                # Link the task back to its exact physical time window
                if task_data and returned_c_idx in corridor_meta:
                    meta = corridor_meta[returned_c_idx]
                    day_idx = str(meta["day"])
                    
                    # Store the exact time gap string inside the task data
                    task_data["allocated_window"] = f"{meta['start']:02d}:00 - {meta['end']:02d}:00"
                    
                    if day_idx in horizon_schedule:
                        horizon_schedule[day_idx].append(task_data)
            except ValueError:
                continue

    return {"status": "success", "horizon_schedule": horizon_schedule}