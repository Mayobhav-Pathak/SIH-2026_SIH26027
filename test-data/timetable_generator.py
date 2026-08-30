import json
import random

SECTIONS = [
    "DEL-CNB-SEC1", "MUM-PUN-SEC2", "HWH-KGP-SEC3", "MAS-SBC-SEC4", "NDLS-CDG-SEC5",
    "BCT-ADI-SEC6", "SC-BZA-SEC7", "LKO-BSB-SEC8", "JP-JU-SEC9", "PNBE-GAYA-SEC10",
    "NGP-BPQ-SEC11", "GHY-DBRG-SEC12", "BBS-VSKP-SEC13", "TVC-ERS-SEC14", "INDB-UJN-SEC15"
]

timetable = []
for day in range(1, 61):
    for sec in SECTIONS:
        # Simulate heavy traffic: 5 to 10 trains per day per track
        num_trains = random.randint(5,10)
        current_hour = 0
        for _ in range(num_trains):
            if current_hour >= 20: break;
            
            entry = random.randint(current_hour, current_hour + 2)
            duration = random.randint(1, 4)
            exit_hr = min(24, entry + duration)
            
            timetable.append({
                "train_id": f"TRN-{random.randint(1000, 9999)}",
                "section_id": sec,
                "day_id": day,
                "entry_hour": entry,
                "exit_hour": exit_hr,
                "is_freight": random.choice([True, False])
            })
            current_hour = exit_hr + random.randint(1, 2) # Buffer between trains

with open("timetable_60days.json", "w") as f:
    json.dump(timetable, f, indent=2)
    
print("Success: Generated timetable_60days.json with train-level gaps.")