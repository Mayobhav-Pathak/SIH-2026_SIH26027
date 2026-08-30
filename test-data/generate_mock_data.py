import json
import random

SECTIONS = [
    "DEL-CNB-SEC1", "MUM-PUN-SEC2", "HWH-KGP-SEC3", "MAS-SBC-SEC4", "NDLS-CDG-SEC5",
    "BCT-ADI-SEC6", "SC-BZA-SEC7", "LKO-BSB-SEC8", "JP-JU-SEC9", "PNBE-GAYA-SEC10",
    "NGP-BPQ-SEC11", "GHY-DBRG-SEC12", "BBS-VSKP-SEC13", "TVC-ERS-SEC14", "INDB-UJN-SEC15"
]

def generate_datasets(num_tasks=10000):

    tasks = []
    for i in range(1, num_tasks + 1):
        tasks.append({
            "id": f"TASK-{i:05d}",
            "department": random.choice(["TMS", "TRD", "SIG"]),
            "section_id": random.choice(SECTIONS),
            "duration_hrs": random.randint(1, 4),
            "defect_severity": random.randint(1, 10),
            "days_overdue": random.randint(0, 20),
            "is_completed": False
        })
        
        
    with open(f"backlog_60days_{num_tasks}.json", "w") as f:
        json.dump(tasks, f, indent=2)
        
    print(f"Success: Generated  and backlog_60days_{num_tasks}.json")

if __name__ == "__main__":
    generate_datasets(10000)