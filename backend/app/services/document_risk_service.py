import base64
import json
import mimetypes
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import error, request

from dotenv import load_dotenv

UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"
FINAL_JSON_PATH = Path(__file__).resolve().parents[2] / "final.json"
BACKEND_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BACKEND_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("OPENAI_EXTRACTION_MODEL", "gpt-4.1-mini")

EXTRACTION_PROMPT = """You are an extraction engine for homeowner insurance risk analysis.

Your job is to read home inspection reports, property claim documents, and similar housing-related records, then extract as much structured information as possible about the property, its condition, prior losses, and anything that could affect homeowner insurance risk.

Return only valid JSON.
Do not include markdown.
Do not include commentary.
Do not invent facts.
If a value is unknown or not stated, use null.
If something is mentioned more than once, keep each occurrence in the occurrences array and also maintain normalized counts.

EXTRACTION GOALS

1. Extract general property details
- address
- city
- state
- zip
- property_type
- occupancy_type
- year_built
- number_of_stories
- square_footage
- roof_age
- roof_remaining_life
- systems mentioned
- inspection dates
- claim dates
- loss dates
- carrier name
- claim number
- policy number
- claim status
- payout amounts
- deductible amounts
- reserve amounts

2. Extract insurance-relevant risk factors
Identify and normalize issues related to:
- structural
- foundation
- roof
- water_damage
- plumbing
- electrical
- fire
- smoke
- mold
- HVAC
- weather
- hail
- wind
- flood
- drainage
- sewer
- tree_hazard
- pest
- prior_loss_history
- repeated_claims
- safety_devices
- deferred_maintenance
- aging_systems

3. Normalize similar wording into a consistent factor_key
Examples:
- “foundation movement in bathroom”
- “bathroom foundation issue”
- “settlement observed near bathroom”
can map to a normalized factor_key such as:
"bathroom_foundation_issue"

4. Count occurrences
- Each document occurrence should have count = 1
- If the same normalized factor appears across multiple documents, increment its total count in the summary_counts object
- Keep the original evidence for every occurrence

5. Capture severity when supported by wording
Allowed values:
- low
- moderate
- high
- unknown

6. Capture timing
- If a year is mentioned, include it
- If a full date is mentioned, include it in ISO format when possible
- If only a year can be determined, store the year only

7. Capture evidence
- Include a short evidence string pulled or paraphrased from the document
- Keep it concise and factual

8. Capture positive / risk-reducing features too
Examples:
- electrical panel updated
- no visible leaks
- monitored alarm
- impact-resistant windows
- recent roof replacement
These should go in a separate protective_features array

OUTPUT JSON SCHEMA

{
  "property": {
    "address": null,
    "city": null,
    "state": null,
    "zip": null,
    "property_type": null,
    "occupancy_type": null,
    "year_built": null,
    "number_of_stories": null,
    "square_footage": null
  },
  "documents": [
    {
      "document_type": null,
      "source_name": null,
      "carrier": null,
      "claim_number": null,
      "policy_number": null,
      "claim_status": null,
      "inspection_date": null,
      "date_reported": null,
      "date_of_loss": null
    }
  ],
  "property_features": [
    {
      "feature_key": null,
      "value": null,
      "unit": null,
      "evidence": null
    }
  ],
  "risk_factors": [
    {
      "factor_key": null,
      "category": null,
      "subcategory": null,
      "location": null,
      "severity": "unknown",
      "count": 1,
      "year": null,
      "date": null,
      "source_type": null,
      "source_name": null,
      "evidence": null
    }
  ],
  "protective_features": [
    {
      "feature_key": null,
      "category": null,
      "value": null,
      "source_type": null,
      "source_name": null,
      "evidence": null
    }
  ],
  "claims_financials": [
    {
      "type": null,
      "amount": null,
      "currency": "USD",
      "source_name": null,
      "evidence": null
    }
  ],
  "summary_counts": {
    "structural": 0,
    "foundation": 0,
    "roof": 0,
    "water_damage": 0,
    "plumbing": 0,
    "electrical": 0,
    "fire": 0,
    "smoke": 0,
    "mold": 0,
    "HVAC": 0,
    "weather": 0,
    "hail": 0,
    "wind": 0,
    "flood": 0,
    "drainage": 0,
    "sewer": 0,
    "tree_hazard": 0,
    "pest": 0,
    "prior_loss_history": 0,
    "repeated_claims": 0,
    "safety_devices": 0,
    "deferred_maintenance": 0,
    "aging_systems": 0
  },
  "notes": [
    {
      "type": null,
      "text": null
    }
  ]
}

NORMALIZATION RULES
- Use snake_case for all keys and factor_key values
- Keep factor_key specific when possible, for example:
  - roof_moderate_wear
  - aging_water_heater
  - kitchen_supply_line_failure
  - kitchen_water_damage
  - prior_loss_history
- Use broad category labels from the allowed categories
- If a statement is explicitly risk-reducing, put it in protective_features instead of risk_factors
- If a document says no issue was observed, do not turn that into a risk factor
- Financial values must be numeric without dollar signs or commas
- Do not infer repair completion unless the document says it happened
- Do not infer hidden damage unless directly stated

FINAL INSTRUCTION
Return only one valid JSON object that combines all provided documents."""

PHOTO_EXTRACTION_PROMPT = """You are an extraction engine for homeowner insurance risk analysis from property photos.

Your job is to analyze uploaded homeowner property photos and extract structured insurance-relevant risk information visible in the images.

Return only valid JSON.
Do not include markdown.
Do not include commentary.
Do not invent facts.
If a value is unknown or not visually supported, use null.
Do not infer hidden damage or unseen conditions.

Focus on visible homeowner insurance risk signals such as:
- roof condition
- exterior damage
- siding damage
- gutters and drainage
- water intrusion evidence
- mold staining
- cracks or structural movement
- tree hazards
- fire or smoke damage
- electrical safety concerns visible in panels/outlets/wiring
- plumbing leaks or corrosion
- trip hazards
- security weaknesses
- protective features such as cameras, alarms, impact-resistant windows, storm shutters, maintained roof, or well-kept drainage

OUTPUT JSON SCHEMA
{
  "photos": [
    {
      "source_name": null,
      "visible_areas": [],
      "quality": null
    }
  ],
  "risk_factors": [
    {
      "factor_key": null,
      "category": null,
      "subcategory": null,
      "location": null,
      "severity": "unknown",
      "count": 1,
      "source_type": "photo",
      "source_name": null,
      "evidence": null
    }
  ],
  "protective_features": [
    {
      "feature_key": null,
      "category": null,
      "value": null,
      "source_type": "photo",
      "source_name": null,
      "evidence": null
    }
  ],
  "summary_counts": {
    "structural": 0,
    "foundation": 0,
    "roof": 0,
    "water_damage": 0,
    "plumbing": 0,
    "electrical": 0,
    "fire": 0,
    "smoke": 0,
    "mold": 0,
    "HVAC": 0,
    "weather": 0,
    "hail": 0,
    "wind": 0,
    "flood": 0,
    "drainage": 0,
    "sewer": 0,
    "tree_hazard": 0,
    "pest": 0,
    "prior_loss_history": 0,
    "repeated_claims": 0,
    "safety_devices": 0,
    "deferred_maintenance": 0,
    "aging_systems": 0
  },
  "notes": [
    {
      "type": null,
      "text": null
    }
  ]
}

NORMALIZATION RULES
- Use snake_case for all keys and factor_key values
- Only extract what is visually supported
- Put clearly positive/risk-reducing observations in protective_features
- If the image quality prevents certainty, use severity unknown and mention the limitation in notes

FINAL INSTRUCTION
Return only one valid JSON object that combines all provided photos."""


def _load_existing_final_json() -> dict[str, Any]:
    if not FINAL_JSON_PATH.exists():
        return {}
    try:
        data = json.loads(FINAL_JSON_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def _list_risk_documents() -> list[Path]:
    if not UPLOADS_DIR.exists():
        return []
    files = []
    for path in sorted(UPLOADS_DIR.iterdir()):
        if not path.is_file():
            continue
        lower_name = path.name.lower()
        if lower_name.startswith("claim_") or lower_name.startswith("inspection_"):
            files.append(path)
    return files


def _list_property_photos() -> list[Path]:
    if not UPLOADS_DIR.exists():
        return []
    files = []
    for path in sorted(UPLOADS_DIR.iterdir()):
        if not path.is_file():
            continue
        lower_name = path.name.lower()
        if lower_name.startswith("photo_"):
            files.append(path)
    return files


def _build_file_input(path: Path) -> dict[str, Any]:
    mime_type, _ = mimetypes.guess_type(path.name)
    mime_type = mime_type or "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("utf-8")

    if mime_type.startswith("image/"):
        return {
            "type": "input_image",
            "image_url": f"data:{mime_type};base64,{encoded}",
        }

    return {
        "type": "input_file",
        "filename": path.name,
        "file_data": f"data:{mime_type};base64,{encoded}",
    }


def _extract_response_text(response_json: dict[str, Any]) -> str:
    output_text = response_json.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    for item in response_json.get("output", []):
        for content in item.get("content", []):
            text = content.get("text")
            if isinstance(text, str) and text.strip():
                return text
    raise RuntimeError("No text output found in OpenAI response.")


def _parse_json_response(raw_text: str) -> dict[str, Any]:
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise
        return json.loads(raw_text[start : end + 1])


def _call_openai(content: list[dict[str, Any]]) -> dict[str, Any]:
    payload = {
        "model": MODEL_NAME,
        "input": [
            {
                "role": "user",
                "content": content,
            }
        ],
        "text": {
            "format": {
                "type": "json_object",
            }
        },
    }

    req = request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=120) as response:
            return json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI API error {exc.code}: {body}") from exc
    except error.URLError as exc:
        raise RuntimeError(f"OpenAI connection failed: {exc}") from exc


def _run_extraction(paths: list[Path], prompt: str, result_key: str, meta_key: str) -> dict[str, Any]:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set in backend/.env.")

    if not paths:
        raise RuntimeError("No matching uploaded files were found for extraction.")

    content: list[dict[str, Any]] = [
        {
            "type": "input_text",
            "text": prompt,
        }
    ]
    content.extend(_build_file_input(path) for path in paths)

    response_json = _call_openai(content)
    parsed = _parse_json_response(_extract_response_text(response_json))

    final_document = _load_existing_final_json()
    final_document[result_key] = parsed
    final_document[meta_key] = {
        "model": MODEL_NAME,
        "source_files": [path.name for path in paths],
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    FINAL_JSON_PATH.write_text(json.dumps(final_document, indent=2), encoding="utf-8")

    return {
        "final_json_path": str(FINAL_JSON_PATH),
        "source_files": [path.name for path in paths],
        "model": MODEL_NAME,
        "result": parsed,
    }


def extract_risk_from_uploaded_documents() -> dict[str, Any]:
    document_paths = _list_risk_documents()
    if not document_paths:
        raise RuntimeError("No claim or inspection documents were found in backend/app/uploads.")
    return _run_extraction(
        document_paths,
        EXTRACTION_PROMPT,
        "document_risk_extraction",
        "document_risk_extraction_meta",
    )


def extract_risk_from_uploaded_property_photos() -> dict[str, Any]:
    photo_paths = _list_property_photos()
    if not photo_paths:
        raise RuntimeError("No uploaded property photos were found in backend/app/uploads.")
    return _run_extraction(
        photo_paths,
        PHOTO_EXTRACTION_PROMPT,
        "photo_risk_extraction",
        "photo_risk_extraction_meta",
    )
