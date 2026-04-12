from pymongo import MongoClient
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["wehack26"]

risk_reports = db["risk_reports"]
users        = db["users"]
properties   = db["properties"]
