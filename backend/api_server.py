from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import subprocess
import os
import json
import re

app = FastAPI(title="IR-ABPS Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/optimize-stream")
async def optimize_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        payload = json.loads(data)
        
        corridors = payload.get("timetable", [])
        tasks = payload.get("tasks", [])
        safety_buffer_mins = int(payload.get("safety_buffer_mins", 60))
        
        task_lookup = {}
        fallback_sec = "DEFAULT_SEC"
        for t in tasks:
            t_id = str(t.get("task_id", t.get("id", "")))
            task_lookup[t_id] = t
            
        # 1. Format inputs for C++
        input_lines = [f"{len(corridors)} {len(tasks)} {safety_buffer_mins}"]
        
        for c in corridors:
            train_id = str(c.get("train_id", "TRN-0")).replace(" ", "_")
            sec_id = str(c.get("section_id", fallback_sec)).replace(" ", "_")
            day_id = str(c.get("day_id", 0))
            input_lines.append(f"{train_id} {sec_id} {day_id} {c.get('entry_hour', 0)} {c.get('exit_hour', 1)}")
            
        for t in tasks:
            t_id = str(t.get("task_id", t.get("id", "T1"))).replace(" ", "_")
            sec_id = str(t.get("section_id", fallback_sec)).replace(" ", "_")
            dur_hrs = str(t.get("duration_hrs", t.get("duration", 1.0)))
            sev = str(t.get("defect_severity", 1))
            overdue = str(t.get("days_overdue", 0))
            input_lines.append(f"{t_id} {sec_id} {dur_hrs} {sev} {overdue}")
            
        cpp_input_text = "\n".join(input_lines) + "\n"
        
        # 2. Execute C++ Binary
        executable = "/usr/local/bin/scheduler" if os.name != 'nt' else "./scheduler.exe"
        process = subprocess.Popen(
            [executable], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        stdout, _ = process.communicate(input=cpp_input_text)
        
        # 3. Stream 4-Part Output back to React
        raw_output = stdout.strip()
        print(f"RAW C++ OUTPUT: {raw_output[:100]}...") # Logs the first 100 chars
        if raw_output:
            for pair in raw_output.split():
                parts = pair.split(":")
                
                # Check for the exact 4 components expected from C++
                if len(parts) == 4:
                    raw_task_id, clean_day_id, start_min, end_min = parts
                    
                    original_task = next((dict(obj) for orig_id, obj in task_lookup.items() if str(orig_id).replace(" ", "_") == raw_task_id), None)
                    
                    if original_task:
                        original_task["day_id"] = clean_day_id
                        
                        # Set precise minute coordinates for the React Allocation Bar
                        original_task["start_min"] = int(start_min)
                        original_task["end_min"] = int(end_min)
                        
                        # Generate nice strings for the UI Table
                        s_hr, s_m = divmod(int(start_min), 60)
                        e_hr, e_m = divmod(int(end_min), 60)
                        original_task["time_window"] = f"{s_hr:02d}:{s_m:02d} - {e_hr:02d}:{e_m:02d}"
                        
                        original_task["duration"] = float(original_task.get("duration_hrs", 1.0))
                        
                        await websocket.send_json({"type": "progress", "task": original_task})
                        
        await websocket.send_json({"type": "complete"})
        
    except WebSocketDisconnect:
        print("Client disconnected.")