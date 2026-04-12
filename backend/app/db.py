from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)

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