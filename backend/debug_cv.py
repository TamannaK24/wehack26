import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.risk import analyze_photo

# test the first 3 photos and print raw findings
PHOTOS_DIR = "test_photos"
photos = sorted([f for f in os.listdir(PHOTOS_DIR) if f.endswith(".jpg")])[:3]

for filename in photos:
    path = os.path.join(PHOTOS_DIR, filename)
    print(f"\n{'='*50}")
    print(f"Photo: {filename}")
    with open(path, "rb") as f:
        image_bytes = f.read()
    try:
        findings = analyze_photo(image_bytes)
        import json
        print(json.dumps(findings, indent=2))
    except Exception as e:
        print(f"ERROR: {e}")
