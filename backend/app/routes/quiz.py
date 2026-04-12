from flask import Blueprint, request, jsonify

quiz_bp = Blueprint("quiz", __name__)

@quiz_bp.route("/quiz", methods=["POST"])
def submit_quiz():
    return jsonify({"message": "Quiz route working"})