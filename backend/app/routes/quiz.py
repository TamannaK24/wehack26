from flask import Blueprint, jsonify, request

from app.services.quiz_service import persist_quiz_responses

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/quiz", methods=["POST"])
def submit_quiz():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({"error": "Expected a JSON object payload"}), 400

    responses = payload.get("responses")
    if not isinstance(responses, list):
        return jsonify({"error": "Expected a responses array"}), 400

    result = persist_quiz_responses(responses)

    status_code = 200 if result["mongoSynced"] else 207
    return jsonify(
        {
            "message": "Quiz saved successfully",
            "path": result["path"],
            "mongoSynced": result["mongoSynced"],
            "mongoError": result["mongoError"],
        }
    ), status_code
