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
            if t.get("section_id"): fallback_sec = str(t.get("section_id"))
            task_lookup[t_id] = t
            
        input_lines = [f"{len(corridors)} {len(tasks)} {safety_buffer_mins}"]
        block_tracker = {}
        
        for c in corridors:
            raw_sec = c.get("section_id", c.get("section", fallback_sec))
            sec_id = str(raw_sec).replace(" ", "_")
            day_id = str(c.get("day_id", 0))
            entry_hr = int(c.get("entry_hour", 0))
            exit_hr = int(c.get("exit_hour", 1))
            cap = max(1, exit_hr - entry_hr)
            freight = 1.0 if c.get("is_freight") else 0.0
            
            input_lines.append(f"{sec_id} {day_id} {cap} {freight}")
            
            if day_id not in block_tracker: block_tracker[day_id] = {}
            if sec_id not in block_tracker[day_id]: block_tracker[day_id][sec_id] = []
            block_tracker[day_id][sec_id].append({
                "rem": cap, "current_start": entry_hr, "window_label": f"{entry_hr:02d}:00 - {exit_hr:02d}:00"
            })
            
        for t in tasks:
            raw_dur = str(t.get("duration_hrs", t.get("duration", t.get("w", 1))))
            dur_digits = ''.join(filter(str.isdigit, raw_dur))
            w = int(dur_digits) if dur_digits else 1
            orig_v = float(t.get("orig_v", t.get("defect_severity", 1.0)))
            t_id = str(t.get("task_id", t.get("id", "T1"))).replace(" ", "_")
            sec_id = str(t.get("section_id", fallback_sec)).replace(" ", "_")
            input_lines.append(f"{w} {orig_v} {t_id} {sec_id}")
            
        cpp_input_text = "\n".join(input_lines)
        executable = "./scheduler.exe" if os.name == 'nt' else "/usr/local/bin/scheduler"
        
        process = subprocess.Popen(
            [executable], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        stdout, _ = process.communicate(input=cpp_input_text)
        
        raw_output = stdout.strip()

        if raw_output:
            for pair in raw_output.split():
                if ":" in pair:
                    raw_task_id, clean_day_id = pair.split(":")
                    
                    original_task = None
                    for orig_id, orig_obj in task_lookup.items():
                        if str(orig_id).replace(" ", "_") == raw_task_id:
                            original_task = dict(orig_obj)
                            break
                    
                    if original_task:
                        original_task["day_id"] = clean_day_id
                        t_sec = str(original_task.get("section_id", fallback_sec)).replace(" ", "_")
                        raw_dur = str(original_task.get("duration_hrs", original_task.get("duration", 1)))
                        dur_digits = ''.join(filter(str.isdigit, raw_dur))
                        t_dur = int(dur_digits) if dur_digits else 1
                        
                        time_window = "N/A"
                        if clean_day_id in block_tracker and t_sec in block_tracker[clean_day_id]:
                            for block in block_tracker[clean_day_id][t_sec]:
                                if block["rem"] >= t_dur:
                                    original_task["start_hour"] = block["current_start"]
                                    original_task["end_hour"] = block["current_start"] + t_dur
                                    original_task["entry_hour"] = block["current_start"]
                                    original_task["exit_hour"] = block["current_start"] + t_dur
                                    time_window = block["window_label"]
                                    
                                    block["rem"] -= t_dur
                                    block["current_start"] += t_dur
                                    break
                                    
                        original_task["time_window"] = time_window
                        await websocket.send_json({"type": "progress", "task": original_task})
                        
        await websocket.send_json({"type": "complete"})
        
    except WebSocketDisconnect:
        print("Client disconnected.")