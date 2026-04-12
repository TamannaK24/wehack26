from pathlib import Path
from uuid import uuid4

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from app.services.document_risk_service import extract_risk_from_uploaded_property_photos

photos_bp = Blueprint("photos", __name__)

UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"


def _save_uploaded_file(prefix, error_message, success_message):
    uploaded_file = request.files.get("file")

    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({"error": error_message}), 400

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = secure_filename(uploaded_file.filename)
    stored_name = f"{prefix}_{uuid4().hex}_{safe_name}"
    destination = UPLOADS_DIR / stored_name
    uploaded_file.save(destination)

    return jsonify(
        {
            "message": success_message,
            "filename": stored_name,
            "originalName": safe_name,
            "path": str(destination),
        }
    )


@photos_bp.route("/inspections", methods=["POST"])
def upload_inspection():
    return _save_uploaded_file(
        "inspection",
        "No inspection file provided",
        "Inspection file uploaded successfully",
    )


@photos_bp.route("/blueprints", methods=["POST"])
def upload_blueprint():
    return _save_uploaded_file(
        "blueprint",
        "No blueprint file provided",
        "Blueprint file uploaded successfully",
    )


@photos_bp.route("/photos", methods=["POST"])
def upload_photo():
    return _save_uploaded_file(
        "photo",
        "No photo file provided",
        "Photo uploaded successfully",
    )


@photos_bp.route("/photos/extract-risk", methods=["POST"])
def extract_photo_risk():
    try:
        result = extract_risk_from_uploaded_property_photos()
        return jsonify(
            {
                "message": "Photo risk extraction saved to final.json",
                "path": result["final_json_path"],
                "sourceFiles": result["source_files"],
                "model": result["model"],
            }
        )
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Unexpected photo extraction failure: {exc}"}), 500
