import json
import random

# The exact 15 sections from your React dashboard
SECTIONS = [
    "DEL-CNB-SEC1", "MUM-PUN-SEC2", "HWH-KGP-SEC3", "MAS-SBC-SEC4", "NDLS-CDG-SEC5",
    "BCT-ADI-SEC6", "SC-BZA-SEC7", "LKO-BSB-SEC8", "JP-JU-SEC9", "PNBE-GAYA-SEC10",
    "NGP-BPQ-SEC11", "GHY-DBRG-SEC12", "BBS-VSKP-SEC13", "TVC-ERS-SEC14", "INDB-UJN-SEC15"
]

DEPARTMENTS = ["SMMS", "TDMS", "TMS"]

def generate_tasks(start_id=1220, count=5000):
    tasks = []
    for i in range(count):
        task = {
            "id": f"TASK-{start_id + i}",
            "department": random.choice(DEPARTMENTS),
            "section_id": random.choice(SECTIONS),
            "duration_hrs": random.randint(1, 3), # Bound between 1-3h to fit train gaps
            "defect_severity": random.randint(1, 5),
            "days_overdue": random.randint(0, 30),
            "traffic_density_gmt": round(random.uniform(20.0, 120.0), 1),
            "asset_age_years": round(random.uniform(1.0, 30.0), 1)
        }
        tasks.append(task)
    return tasks

if __name__ == "__main__":
    # Generating 5,000 new tasks starting exactly where your last batch ended
    NUM_TASKS = 5000
    START_ID = 1220 
    
    new_tasks = generate_tasks(start_id=START_ID, count=NUM_TASKS)
    
    output_filename = "massive_task_backlog.json"
    with open(output_filename, "w") as f:
        json.dump(new_tasks, f, indent=2)
        
    print(f"✅ Successfully generated {NUM_TASKS} tasks!")
    print(f"💾 Saved to {output_filename}")