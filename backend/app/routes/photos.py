from pathlib import Path
from uuid import uuid4

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

photos_bp = Blueprint("photos", __name__)

UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"


@photos_bp.route("/inspections", methods=["POST"])
@photos_bp.route("/photos", methods=["POST"])
def upload_photo():
    uploaded_file = request.files.get("file")

    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({"error": "No inspection file provided"}), 400

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = secure_filename(uploaded_file.filename)
    stored_name = f"inspection_{uuid4().hex}_{safe_name}"
    destination = UPLOADS_DIR / stored_name
    uploaded_file.save(destination)

    return jsonify(
        {
            "message": "Inspection file uploaded successfully",
            "filename": stored_name,
            "originalName": safe_name,
            "path": str(destination),
        }
    )
