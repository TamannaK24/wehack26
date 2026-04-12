from pathlib import Path
from uuid import uuid4

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from app.services.document_risk_service import extract_risk_from_uploaded_documents

claims_bp = Blueprint("claims", __name__)

UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"


@claims_bp.route("/claims", methods=["POST"])
def upload_claim():
    uploaded_file = request.files.get("file")

    if uploaded_file is None or not uploaded_file.filename:
        return jsonify({"error": "No claim file provided"}), 400

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = secure_filename(uploaded_file.filename)
    stored_name = f"claim_{uuid4().hex}_{safe_name}"
    destination = UPLOADS_DIR / stored_name
    uploaded_file.save(destination)

    return jsonify(
        {
            "message": "Claim file uploaded successfully",
            "filename": stored_name,
            "originalName": safe_name,
            "path": str(destination),
        }
    )


@claims_bp.route("/documents/extract-risk", methods=["POST"])
def extract_document_risk():
    try:
        result = extract_risk_from_uploaded_documents()
        return jsonify(
            {
                "message": "Document risk extraction saved to final.json",
                "path": result["final_json_path"],
                "sourceFiles": result["source_files"],
                "model": result["model"],
            }
        )
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Unexpected extraction failure: {exc}"}), 500
