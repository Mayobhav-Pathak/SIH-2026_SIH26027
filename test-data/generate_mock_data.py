import json
import random

# The 15 Major Railway Sections
SECTIONS = [
    "DEL-CNB-SEC1", "MUM-PUN-SEC2", "HWH-KGP-SEC3", "MAS-SBC-SEC4", "NDLS-CDG-SEC5",
    "BCT-ADI-SEC6", "SC-BZA-SEC7", "LKO-BSB-SEC8", "JP-JU-SEC9", "PNBE-GAYA-SEC10",
    "NGP-BPQ-SEC11", "GHY-DBRG-SEC12", "BBS-VSKP-SEC13", "TVC-ERS-SEC14", "INDB-UJN-SEC15"
]

DEPARTMENTS = ["TMS", "SMMS", "TDMS"]

def generate_timetable():
    timetable = []
    # Generate schedules for Day 0 to Day 29
    for day in range(30):
        for sec in SECTIONS:
            # 3 to 5 trains per day per section to create realistic gaps
            num_trains = random.randint(3, 5)
            current_hour = random.randint(0, 2)
            
            for i in range(num_trains):
                entry = current_hour
                duration = random.randint(2, 4)
                exit_hr = min(24, entry + duration)
                
                timetable.append({
                    "train_id": f"TRN-{random.randint(1000, 9999)}",
                    "section_id": sec,
                    "day_id": day,
                    "entry_hour": entry,
                    "exit_hour": exit_hr,
                    "is_freight": random.choice([True, False])
                })
                
                current_hour = exit_hr + random.randint(2, 6) # Gap before next train
                if current_hour >= 24:
                    break
    return timetable

def generate_backlog():
    backlog = []
    # Generate ~200 maintenance tasks distributed across the 15 sections
    for i in range(200):
        backlog.append({
            "id": f"TASK-{1000 + i}",
            "department": random.choice(DEPARTMENTS),
            "section_id": random.choice(SECTIONS),
            "duration_hrs": random.randint(1, 5),
            "defect_severity": random.randint(1, 5),
            "days_overdue": random.randint(0, 30),
            "traffic_density_gmt": round(random.uniform(20.0, 120.0), 1),
            "asset_age_years": round(random.uniform(1.0, 30.0), 1)
        })
    return backlog

if __name__ == "__main__":
    with open("train_data.json", "w") as f:
        json.dump(generate_timetable(), f, indent=2)
    with open("test_data.json", "w") as f:
        json.dump(generate_backlog(), f, indent=2)
        
    print(f"Successfully generated 15-section dataset!")