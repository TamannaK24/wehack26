from flask import Blueprint, request, jsonify
from app.db import risk_reports

risk_bp = Blueprint("risk", __name__)

@risk_bp.route("/score", methods=["POST"])
def calculate_risk():
    data = request.json

    score = 100

    if data.get("roof_age", 0) > 15:
        score -= 20
    if data.get("flood_zone"):
        score -= 25
    if not data.get("smoke_detectors", True):
        score -= 20

    result = {
        "score": max(score, 0),
        "inputs": data
    }

    risk_reports.insert_one(result)

    return jsonify(result)