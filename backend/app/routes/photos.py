from flask import Blueprint, request, jsonify

photos_bp = Blueprint("photos", __name__)

@photos_bp.route("/photos", methods=["POST"])
def upload_photo():
    return jsonify({"message": "Photo route working"})