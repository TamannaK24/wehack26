import os
import json
from openai import OpenAI
from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot", __name__)
client     = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SUGGESTION_IMPACTS = {
    "replace_roof":            {"roof": -30, "natural_disasters": -10},
    "fix_foundation":          {"foundation": -25},
    "install_smoke_detectors": {"fire": -12},
    "install_security_system": {"theft": -20},
    "fix_plumbing":            {"water_damage": -20},
    "remove_tree_overhang":    {"natural_disasters": -12},
    "fix_electrical_panel":    {"fire": -25},
    "install_sump_pump":       {"water_damage": -12},
    "add_fire_extinguisher":   {"fire": -5},
    "fix_mold":                {"water_damage": -20},
    "add_deadbolt":            {"theft": -12},
    "add_security_camera":     {"theft": -10},
    "clean_gutters":           {"water_damage": -8, "roof": -5},
}

WEIGHTS = {
    "roof": 0.34, "water_damage": 0.29, "fire": 0.09,
    "theft": 0.06, "foundation": 0.12, "natural_disasters": 0.06, "maintenance": 0.04,
}


@chatbot_bp.route("/whatif", methods=["POST"])
def what_if():
    data               = request.json
    action             = data.get("action")
    current_categories = data.get("categories")
    current_score      = data.get("current_score")

    if not all([action, current_categories, current_score]):
        return jsonify({"error": "Missing required fields"}), 400

    impacts = SUGGESTION_IMPACTS.get(action)
    if not impacts:
        return jsonify({"error": f"Unknown action: {action}"}), 400

    new_categories = current_categories.copy()
    for category, change in impacts.items():
        new_categories[category] = max(0, min(100, new_categories[category] + change))

    new_score   = round(sum(new_categories[k] * WEIGHTS[k] for k in WEIGHTS))
    improvement = current_score - new_score

    return jsonify({
        "action":        action,
        "current_score": current_score,
        "new_score":     new_score,
        "improvement":   improvement,
        "affected":      impacts,
        "message":       f"If you {action.replace('_',' ')}, your score would improve from {current_score} to {new_score} (↓{improvement} points)."
    })


@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    data             = request.json
    user_message     = data.get("message")
    property_context = data.get("property_context")

    if not user_message or not property_context:
        return jsonify({"error": "Missing message or property context"}), 400

    system_prompt = f"""
You are a home risk assessment advisor. You know everything about this specific property:

Risk Score: {property_context.get('final_score')}/100 ({property_context.get('label')})

Category Scores:
{json.dumps(property_context.get('categories', {}), indent=2)}

Top Risk Drivers:
{json.dumps(property_context.get('top_drivers', []), indent=2)}

Weight Source: {property_context.get('weight_source')}

Your job:
- Answer questions about this specific home's risks using only the data provided above
- Explain risk drivers in plain, jargon-free English that a homeowner can immediately understand
- When asked about actions or improvements, always reference the exact score numbers from the context
- Keep all responses under 100 words
- Never assume, invent, or reference data not explicitly provided in the context above
- If the user asks something outside the scope of their home risk data, politely redirect them back to their assessment
- Do NOT use markdown formatting like **bold** or ## headers — plain text only
- When listing multiple points use this exact format with a newline between each point:
- Point one
- Point two
- Point three
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=300,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_message}
        ]
    )

    return jsonify({"response": response.choices[0].message.content})


@chatbot_bp.route("/suggestions", methods=["GET"])
def suggestions():
    return jsonify({
        "suggestions": [
            {"action": "replace_roof",            "label": "Replace your roof",             "category": "roof"},
            {"action": "fix_foundation",           "label": "Address foundation issues",     "category": "foundation"},
            {"action": "install_smoke_detectors",  "label": "Install smoke detectors",       "category": "fire"},
            {"action": "install_security_system",  "label": "Install security system",       "category": "theft"},
            {"action": "fix_plumbing",             "label": "Fix plumbing issues",           "category": "water_damage"},
            {"action": "remove_tree_overhang",     "label": "Remove overhanging trees",      "category": "natural_disasters"},
            {"action": "fix_electrical_panel",     "label": "Replace electrical panel",      "category": "fire"},
            {"action": "install_sump_pump",        "label": "Install sump pump",             "category": "water_damage"},
            {"action": "add_fire_extinguisher",    "label": "Add fire extinguisher",         "category": "fire"},
            {"action": "fix_mold",                 "label": "Remediate mold",                "category": "water_damage"},
            {"action": "add_deadbolt",             "label": "Install deadbolt locks",        "category": "theft"},
            {"action": "add_security_camera",      "label": "Add security cameras",          "category": "theft"},
            {"action": "clean_gutters",            "label": "Clean and repair gutters",      "category": "roof"},
        ]
    })