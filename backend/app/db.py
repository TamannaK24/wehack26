from pathlib import Path
import os
import json

from dotenv import load_dotenv
from pymongo import MongoClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise RuntimeError("MONGO_URI is not set. Expected it in backend/.env.")

client = MongoClient(mongo_uri, serverSelectionTimeoutMS=750)

db = client["riskdb"]
risk_reports = db["risk_reports"]
homes_collection = db["homes"]

def insert_json_to_mongodb(json_file_path):
    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # make sure the JSON is a list
    if isinstance(data, dict):
        data = [data]

    if not data:
        print("No data found in JSON file.")
        return

    result = homes_collection.insert_many(data)
    print(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")

# 👇 THIS RUNS THE FUNCTION
if __name__ == "__main__":
    insert_json_to_mongodb(r"C:\Projects\wehack26\backend\address.json")
