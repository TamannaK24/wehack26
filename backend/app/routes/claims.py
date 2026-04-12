from flask import Blueprint, request, jsonify

claims_bp = Blueprint("claims", __name__)

@claims_bp.route("/claims", methods=["POST"])
def upload_claim():
    return jsonify({"message": "Claim route working"})