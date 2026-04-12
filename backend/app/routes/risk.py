import json
from pathlib import Path

from flask import Blueprint, jsonify, make_response

from app.services.risk_score_service import calculate_risk_scores

risk_bp = Blueprint("risk", __name__)
RISK_JSON_PATH = Path(__file__).resolve().parents[2] / "risk.json"
FINAL_JSON_PATH = Path(__file__).resolve().parents[2] / "final.json"


def _read_json_file(path: Path):
    if not path.exists():
        return None

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        return None


@risk_bp.route("/final", methods=["GET"])
def get_final():
    data = _read_json_file(FINAL_JSON_PATH)
    if data is None:
        return jsonify({"error": "final.json is missing or invalid"}), 400
    return jsonify(data)


@risk_bp.route("/risk", methods=["GET"])
def get_risk():
    try:
        payload = calculate_risk_scores()
        response = make_response(jsonify(payload))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Unexpected risk scoring failure: {exc}"}), 500


@risk_bp.route("/risk/calculate", methods=["POST"])
def calculate_risk():
    try:
        result = calculate_risk_scores()
        return jsonify(
            {
                "message": "Risk scores saved to risk.json",
                "masterScore": result["masterScore"],
                "riskTier": result["riskTier"],
                "subscores": result["subscores"],
            }
        )
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Unexpected risk scoring failure: {exc}"}), 500
