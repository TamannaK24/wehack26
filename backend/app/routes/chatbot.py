import json
import os

from flask import Blueprint, jsonify, request

chatbot_bp = Blueprint("chatbot", __name__)

SUGGESTION_IMPACTS = {
    "replace_roof": {"roof": -30, "natural_disasters": -10},
    "fix_foundation": {"foundation": -25},
    "install_smoke_detectors": {"fire": -12},
    "install_security_system": {"theft": -20},
    "fix_plumbing": {"water_damage": -20},
    "remove_tree_overhang": {"natural_disasters": -12},
    "fix_electrical_panel": {"fire": -25},
    "install_sump_pump": {"water_damage": -12},
    "add_fire_extinguisher": {"fire": -5},
    "fix_mold": {"water_damage": -20},
    "add_deadbolt": {"theft": -12},
    "add_security_camera": {"theft": -10},
    "clean_gutters": {"water_damage": -8, "roof": -5},
}

WEIGHTS = {
    "roof": 0.34,
    "water_damage": 0.29,
    "fire": 0.09,
    "theft": 0.06,
    "foundation": 0.12,
    "natural_disasters": 0.06,
    "maintenance": 0.04,
}


def _create_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("The OpenAI Python package is not installed.") from exc

    return OpenAI(api_key=api_key)


@chatbot_bp.route("/whatif", methods=["POST"])
def what_if():
    data = request.get_json(silent=True) or {}
    action = data.get("action")
    current_categories = data.get("categories")
    current_score = data.get("current_score")

    if not action or not isinstance(current_categories, dict) or current_score is None:
        return jsonify({"error": "Missing required fields"}), 400

    impacts = SUGGESTION_IMPACTS.get(action)
    if not impacts:
        return jsonify({"error": f"Unknown action: {action}"}), 400

    new_categories = dict(current_categories)
    for category, change in impacts.items():
        previous = float(new_categories.get(category, 0))
        new_categories[category] = max(0, min(100, previous + change))

    new_score = round(sum(float(new_categories.get(key, 0)) * weight for key, weight in WEIGHTS.items()))
    improvement = float(current_score) - new_score

    return jsonify(
        {
            "action": action,
            "current_score": current_score,
            "new_score": new_score,
            "improvement": improvement,
            "affected": impacts,
            "message": f"If you {action.replace('_', ' ')}, your score would improve from {current_score} to {new_score} ({improvement:+.0f} points).",
        }
    )


@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message")
    property_context = data.get("property_context")

    if not user_message or not isinstance(property_context, dict):
        return jsonify({"error": "Missing message or property context"}), 400

    system_prompt = f"""
You are a home risk assessment advisor. You know everything about this specific property:

Risk Score: {property_context.get('final_score')}/100 ({property_context.get('label')})

Category Scores:
{json.dumps(property_context.get('categories', {}), indent=2)}

Top Risk Drivers:
{json.dumps(property_context.get('top_drivers', []), indent=2)}

Weight Source: {property_context.get('weight_source')}

Address Context:
{json.dumps(property_context.get('address', None), indent=2)}

Quiz Responses:
{json.dumps(property_context.get('quiz_responses', []), indent=2)}

Document Extraction:
{json.dumps(property_context.get('document_summary', None), indent=2)}

Photo Extraction:
{json.dumps(property_context.get('photo_summary', None), indent=2)}

Your job:
- Answer questions about this specific home's risks using only the data provided above
- Explain risk drivers in plain, jargon-free English that a homeowner can immediately understand
- When asked about actions or improvements, always reference the exact score numbers from the context
- Keep all responses under 100 words
- Never assume, invent, or reference data not explicitly provided in the context above
- If the user asks something outside the scope of their home risk data, politely redirect them back to their assessment
- Do not use markdown formatting like bold or headers
- When listing multiple points, use one short sentence per line
""".strip()

    try:
        client = _create_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=300,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    return jsonify({"response": response.choices[0].message.content})


@chatbot_bp.route("/suggestions", methods=["GET"])
def suggestions():
    return jsonify(
        {
            "suggestions": [
                {"action": "replace_roof", "label": "Replace your roof", "category": "roof"},
                {"action": "fix_foundation", "label": "Address foundation issues", "category": "foundation"},
                {"action": "install_smoke_detectors", "label": "Install smoke detectors", "category": "fire"},
                {"action": "install_security_system", "label": "Install security system", "category": "theft"},
                {"action": "fix_plumbing", "label": "Fix plumbing issues", "category": "water_damage"},
                {"action": "remove_tree_overhang", "label": "Remove overhanging trees", "category": "natural_disasters"},
                {"action": "fix_electrical_panel", "label": "Replace electrical panel", "category": "fire"},
                {"action": "install_sump_pump", "label": "Install sump pump", "category": "water_damage"},
                {"action": "add_fire_extinguisher", "label": "Add fire extinguisher", "category": "fire"},
                {"action": "fix_mold", "label": "Remediate mold", "category": "water_damage"},
                {"action": "add_deadbolt", "label": "Install deadbolt locks", "category": "theft"},
                {"action": "add_security_camera", "label": "Add security cameras", "category": "theft"},
                {"action": "clean_gutters", "label": "Clean and repair gutters", "category": "roof"},
            ]
        }
    )
