from flask import Blueprint, request, jsonify
from datetime import datetime
from app.db import risk_reports

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/quiz", methods=["POST"])
def save_quiz():
    data = request.get_json()

    document = {
        "created_at": datetime.utcnow().isoformat(),
        "quiz_answers": {
            "burglar_alarms":                   int(data.get("burglar_alarms", 0)),
            "exterior_security_cameras":        int(data.get("exterior_security_cameras", 0)),
            "smoke_detectors":                  int(data.get("smoke_detectors", 0)),
            "monitored_fire_alarm_systems":     int(data.get("monitored_fire_alarm_systems", 0)),
            "water_leak_detectors":             int(data.get("water_leak_detectors", 0)),
            "smart_water_shutoff_valves":       int(data.get("smart_water_shutoff_valves", 0)),
            "fire_extinguishers":               int(data.get("fire_extinguishers", 0)),
            "storm_shutters_or_impact_windows": int(data.get("storm_shutters_or_impact_windows", 0)),
            "backup_generators":                int(data.get("backup_generators", 0)),
        }
    }

    result = risk_reports.insert_one(document)

    return jsonify({
        "message": "Quiz answers saved",
        "id":      str(result.inserted_id),
        "answers": document["quiz_answers"]
    }), 201