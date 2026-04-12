import os
import requests
import json
import csv

# folder where your split photos are
PHOTOS_DIR = "test_photos"
API_URL    = "http://localhost:5000/api/analyze"
RESULTS    = []

photo_files = sorted([
    f for f in os.listdir(PHOTOS_DIR)
    if f.endswith(".jpg")
])

print(f"Found {len(photo_files)} photos to test\n")

for i, filename in enumerate(photo_files):
    filepath = os.path.join(PHOTOS_DIR, filename)

    with open(filepath, "rb") as f:
        response = requests.post(
            API_URL,
            files={"photo": (filename, f, "image/jpeg")}
        )

    if response.status_code == 200:
        result = response.json()
        row = {
            "photo":          filename,
            "final_score":    result.get("final_score"),
            "label":          result.get("label"),
            "area_detected":  result.get("all_drivers", [{}])[0].get("category", "none") if result.get("all_drivers") else "none",
            "top_driver_1":   result.get("top_drivers", [{}])[0].get("finding", "none") if len(result.get("top_drivers", [])) > 0 else "none",
            "top_driver_2":   result.get("top_drivers", [{}])[1].get("finding", "none") if len(result.get("top_drivers", [])) > 1 else "none",
            "top_driver_3":   result.get("top_drivers", [{}])[2].get("finding", "none") if len(result.get("top_drivers", [])) > 2 else "none",
            "roof_score":     result.get("categories", {}).get("roof"),
            "water_score":    result.get("categories", {}).get("water_damage"),
            "fire_score":     result.get("categories", {}).get("fire"),
            "theft_score":    result.get("categories", {}).get("theft"),
            "foundation_score": result.get("categories", {}).get("foundation"),
            "disaster_score": result.get("categories", {}).get("natural_disasters"),
            "maintenance_score": result.get("categories", {}).get("maintenance"),
        }
        RESULTS.append(row)
        print(f"[{i+1}/{len(photo_files)}] {filename} → Score: {result.get('final_score')} ({result.get('label')})")
    else:
        print(f"[{i+1}/{len(photo_files)}] {filename} → ERROR: {response.status_code}")
        RESULTS.append({"photo": filename, "final_score": "ERROR", "label": "ERROR"})

# save results to CSV
with open("test_results.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=RESULTS[0].keys())
    writer.writeheader()
    writer.writerows(RESULTS)

print(f"\nDone. Results saved to test_results.csv")
print(f"Low Risk:      {sum(1 for r in RESULTS if r.get('label') == 'Low Risk')}")
print(f"Moderate Risk: {sum(1 for r in RESULTS if r.get('label') == 'Moderate Risk')}")
print(f"High Risk:     {sum(1 for r in RESULTS if r.get('label') == 'High Risk')}")