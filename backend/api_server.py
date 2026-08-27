from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import subprocess
import os

# Initialize FastAPI
app = FastAPI(title="IR-ABPS Gateway")

# CORS Middleware to allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected JSON payload from React
class OptimizationRequest(BaseModel):
    timetable: List[Dict[str, Any]]
    tasks: List[Dict[str, Any]]
    safety_buffer_mins: int = 60

@app.post("/api/optimize-blocks")
async def optimize_blocks(payload: OptimizationRequest):
    try:
        input_data = payload.dict()
        corridors = input_data.get("timetable", [])
        tasks = input_data.get("tasks", [])
        
        # 1. Initialization and Fallbacks
        task_lookup = {}
        fallback_sec = "DEFAULT_SEC"
        
        # Map original tasks for quick lookup later
        for t in tasks:
            t_id = str(t.get("task_id", t.get("id", "")))
            if t.get("section_id"):
                fallback_sec = str(t.get("section_id"))
            task_lookup[t_id] = t
            
        input_lines = [f"{len(corridors)} {len(tasks)}"]
        
        # --- THE CLOCK TRACKER ---
        # We build a dictionary to track exactly how much time is left in every train gap
        # so we can give React the exact start/end hours for the Gantt chart.
        block_tracker = {}
        
        # 2. Map Corridors (Calculate true capacity from hours!)
        for c in corridors:
            raw_sec = c.get("section_id", c.get("section", fallback_sec))
            sec_id = str(raw_sec).replace(" ", "_")
            day_id = str(c.get("day_id", 0))
            
            entry_hr = int(c.get("entry_hour", 0))
            exit_hr = int(c.get("exit_hour", 1))
            cap = exit_hr - entry_hr
            
            # Failsafe for valid capacity
            if cap <= 0: 
                cap = 1
                
            freight = 1.0 if c.get("is_freight") else 0.0
            input_lines.append(f"{sec_id} {day_id} {cap} {freight}")
            
            # Register this gap in our Clock Tracker
            if day_id not in block_tracker:
                block_tracker[day_id] = {}
            if sec_id not in block_tracker[day_id]:
                block_tracker[day_id][sec_id] = []
                
            block_tracker[day_id][sec_id].append({
                "rem": cap,
                "current_start": entry_hr,
                "window_label": f"{entry_hr:02d}:00 - {exit_hr:02d}:00"
            })
            
        # 3. Safely map Tasks (Strip strings like "4h" into integers)
        for t in tasks:
            raw_dur = str(t.get("duration_hrs", t.get("duration", t.get("w", 1))))
            dur_digits = ''.join(filter(str.isdigit, raw_dur))
            w = int(dur_digits) if dur_digits else 1
            
            orig_v = float(t.get("orig_v", t.get("defect_severity", 1.0)))
            t_id = str(t.get("task_id", t.get("id", "T1"))).replace(" ", "_")
            sec_id = str(t.get("section_id", fallback_sec)).replace(" ", "_")
            
            input_lines.append(f"{w} {orig_v} {t_id} {sec_id}")
            
        cpp_input_text = "\n".join(input_lines)
        
        # 4. Execute C++ Engine
        executable = "./scheduler.exe" if os.name == 'nt' else "/usr/local/bin/scheduler"
        process = subprocess.Popen(
            [executable],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=cpp_input_text)
        
        # 5. Parse Output, Inject Exact Hours, and Format for React
        raw_output = stdout.strip()
        parsed_schedule = {str(i): [] for i in range(32)}
        
        if raw_output:
            for pair in raw_output.split():
                if ":" in pair:
                    raw_task_id, day_id = pair.split(":")
                    clean_day_id = str(day_id)
                    
                    if clean_day_id not in parsed_schedule:
                        parsed_schedule[clean_day_id] = []
                    
                    # Find the original task object
                    original_task = None
                    for orig_id, orig_obj in task_lookup.items():
                        if str(orig_id).replace(" ", "_") == raw_task_id:
                            original_task = dict(orig_obj)
                            break
                    
                    if original_task:
                        original_task["day_id"] = clean_day_id
                        
                        # -- EXACT GANTT CHART INJECTION --
                        t_sec = str(original_task.get("section_id", fallback_sec)).replace(" ", "_")
                        
                        raw_dur = str(original_task.get("duration_hrs", original_task.get("duration", 1)))
                        dur_digits = ''.join(filter(str.isdigit, raw_dur))
                        t_dur = int(dur_digits) if dur_digits else 1
                        
                        time_window = "N/A"
                        
                        # Find the gap it was assigned to, and calculate exact start/end hours
                        if clean_day_id in block_tracker and t_sec in block_tracker[clean_day_id]:
                            for block in block_tracker[clean_day_id][t_sec]:
                                if block["rem"] >= t_dur:
                                    # Calculate exact times
                                    start_hr = block["current_start"]
                                    end_hr = start_hr + t_dur
                                    
                                    # Inject properties for the frontend Gantt Chart
                                    original_task["start_hour"] = start_hr
                                    original_task["end_hour"] = end_hr
                                    original_task["entry_hour"] = start_hr
                                    original_task["exit_hour"] = end_hr
                                    
                                    time_window = block["window_label"]
                                    
                                    # Consume the capacity so the next task starts where this one ends
                                    block["rem"] -= t_dur
                                    block["current_start"] = end_hr
                                    break
                                    
                        original_task["time_window"] = time_window
                        
                        parsed_schedule[clean_day_id].append(original_task)
        
        return {
            "status": "success",
            "horizon_schedule": parsed_schedule
        }
        
    except Exception as e:
        return {"status": "error", "message": f"Data Mapping Error: {str(e)}"}