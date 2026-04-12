import os
import json
import base64
from openai import OpenAI
from flask import Blueprint, request, jsonify
from app.db import risk_reports

risk_bp = Blueprint("risk", __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ─────────────────────────────────────────
# WEIGHTS — Insurance Information Institute
# 2023 Claims Frequency Data
# source: iii.org/fact-statistic
# ─────────────────────────────────────────
WEIGHTS = {
    "roof":              0.34,
    "water_damage":      0.29,
    "fire":              0.09,
    "theft":             0.06,
    "foundation":        0.12,
    "natural_disasters": 0.06,
    "maintenance":       0.04,
}

SEVERITY = {
    "critical": 40,
    "high":     25,
    "medium":   12,
    "low":       5,
}

# ─────────────────────────────────────────
# PROMPTS
# ─────────────────────────────────────────

IDENTIFY_PROMPT = """
Look at this photo and return ONLY valid JSON, no other text:
{
  "area_type": "roof|exterior|kitchen|bathroom|basement|garage|living_room|bedroom|electrical_panel|foundation|other",
  "description": "one sentence of what you see"
}
"""

AREA_PROMPTS = {
    "roof": """
        Analyze this roof photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "damage_score": 0-10,
          "missing_shingles": true|false,
          "moss_present": true|false,
          "sagging": true|false,
          "estimated_age": "0-5|5-15|15-25|25+"
        }
    """,
    "kitchen": """
        Analyze this kitchen photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "water_stains_visible": true|false,
          "grease_buildup_near_stove": true|false,
          "fire_extinguisher_visible": true|false,
          "smoke_detector_visible": true|false,
          "leaking_pipes_visible": true|false,
          "maintenance_score": 0-10
        }
    """,
    "bathroom": """
        Analyze this bathroom photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "water_stains_visible": true|false,
          "mold_visible": true|false,
          "leaking_pipes_visible": true|false,
          "maintenance_score": 0-10
        }
    """,
    "electrical_panel": """
        Analyze this electrical panel photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "panel_brand_visible": "string or null",
          "breakers_labeled": true|false,
          "signs_of_burning": true|false,
          "double_tapped_breakers": true|false,
          "rust_present": true|false
        }
    """,
    "garage": """
        Analyze this garage photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "clutter_level": "low|medium|high",
          "flammable_storage_visible": true|false,
          "maintenance_score": 0-10
        }
    """,
    "foundation": """
        Analyze this foundation photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "cracks_visible": true|false,
          "crack_severity": "none|hairline|moderate|severe",
          "water_damage_signs": true|false
        }
    """,
    "exterior": """
        Analyze this exterior photo. Return ONLY valid JSON:
        {
          "condition": "good|fair|poor",
          "foundation_cracks_visible": true|false,
          "water_stains": true|false,
          "tree_overhang": true|false,
          "vegetation_overgrowth": true|false,
          "security_camera": true|false,
          "deadbolt_visible": true|false
        }
    """,
    "other": """
        Analyze this home photo. Return ONLY valid JSON:
        {
          "area_description": "string",
          "condition": "good|fair|poor",
          "risks_identified": [],
          "maintenance_score": 0-10
        }
    """
}

INSPECTION_PROMPT = """
Extract these fields from this home inspection report.
Return ONLY valid JSON, no other text:
{
  "roof_age": number or null,
  "roof_material": "string or null",
  "foundation_issues": true|false|null,
  "water_damage_history": true|false|null,
  "hvac_last_service": number or null,
  "water_heater_age": number or null,
  "electrical_panel_brand": "string or null",
  "smoke_detectors_present": true|false|null,
  "carbon_monoxide_detectors": true|false|null,
  "plumbing_issues": true|false|null,
  "mold_present": true|false|null,
  "security_system": true|false|null
}
"""

CLAIMS_PROMPT = """
Extract these fields from this insurance claims document.
Return ONLY valid JSON, no other text:
{
  "prior_fire_claims": number or null,
  "prior_water_claims": number or null,
  "prior_theft_claims": number or null,
  "prior_weather_claims": number or null,
  "total_claims_count": number or null,
  "most_recent_claim_year": number or null
}
"""

# ─────────────────────────────────────────
# CV ANALYSIS
# ─────────────────────────────────────────

def analyze_photo(image_bytes, media_type="image/jpeg"):
    image_data = base64.standard_b64encode(image_bytes).decode("utf-8")

    def call_openai(prompt):
        return client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=500,
            response_format={"type": "json_object"},
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{image_data}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }]
        )

    # step 1 — identify the area
    identify_res = call_openai(IDENTIFY_PROMPT)
    identified   = json.loads(identify_res.choices[0].message.content)
    area_type    = identified.get("area_type", "other")

    # step 2 — analyze with area-specific prompt
    prompt       = AREA_PROMPTS.get(area_type, AREA_PROMPTS["other"])
    analysis_res = call_openai(prompt)
    findings     = json.loads(analysis_res.choices[0].message.content)
    findings["area_type"] = area_type

    return findings

# ─────────────────────────────────────────
# DOCUMENT PARSING
# ─────────────────────────────────────────

def parse_document(pdf_bytes, doc_type="inspection"):
    import tempfile
    import os as _os

    prompt = INSPECTION_PROMPT if doc_type == "inspection" else CLAIMS_PROMPT

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            client.files.create(file=f, purpose="assistants")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"Here is the document content to analyze.\n\n{prompt}"
            }]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Document parse error: {e}")
        return {}
    finally:
        _os.unlink(tmp_path)


# ─────────────────────────────────────────
# SCORE MODIFIERS
# ─────────────────────────────────────────

def apply_cv_modifiers(categories, cv, drivers):
    area = cv.get("area_type")

    if area == "roof":
        if cv.get("sagging"):
            categories["roof"] += SEVERITY["critical"]
            drivers.append({"category": "roof", "finding": "Roof sagging detected", "impact": SEVERITY["critical"], "reason": "Sagging indicates imminent structural failure"})
        if cv.get("condition") == "poor":
            categories["roof"] += SEVERITY["high"]
            drivers.append({"category": "roof", "finding": "Roof in poor condition", "impact": SEVERITY["high"], "reason": "Poor condition significantly increases wind/hail claim risk"})
        elif cv.get("condition") == "fair":
            categories["roof"] += SEVERITY["medium"]
            drivers.append({"category": "roof", "finding": "Roof in fair condition", "impact": SEVERITY["medium"], "reason": "Fair condition roof has moderate wind/hail vulnerability"})
        if cv.get("missing_shingles"):
            categories["roof"] += SEVERITY["high"]
            drivers.append({"category": "roof", "finding": "Missing shingles", "impact": SEVERITY["high"], "reason": "Missing shingles expose roof to water and wind damage"})
        if cv.get("moss_present"):
            categories["roof"] += SEVERITY["medium"]
            drivers.append({"category": "roof", "finding": "Moss/algae on roof", "impact": SEVERITY["medium"], "reason": "Moss traps moisture and degrades roofing material"})
        age = cv.get("estimated_age", "0-5")
        if age == "25+":
            categories["roof"] += SEVERITY["critical"]
            drivers.append({"category": "roof", "finding": "Roof estimated 25+ years old", "impact": SEVERITY["critical"], "reason": "Exceeds typical lifespan — replacement imminent"})
        elif age == "15-25":
            categories["roof"] += SEVERITY["high"]
            drivers.append({"category": "roof", "finding": "Roof estimated 15-25 years old", "impact": SEVERITY["high"], "reason": "Approaching end of typical 20-25 year lifespan"})

    elif area == "kitchen":
        if cv.get("grease_buildup_near_stove"):
            categories["fire"] += SEVERITY["high"]
            drivers.append({"category": "fire", "finding": "Grease buildup near stove", "impact": SEVERITY["high"], "reason": "Cooking fires are the #1 cause of home fires"})
        if cv.get("water_stains_visible"):
            categories["water_damage"] += SEVERITY["medium"]
            drivers.append({"category": "water_damage", "finding": "Water stains in kitchen", "impact": SEVERITY["medium"], "reason": "Indicates past or ongoing leak"})
        if not cv.get("fire_extinguisher_visible"):
            categories["fire"] += SEVERITY["low"]
            drivers.append({"category": "fire", "finding": "No fire extinguisher visible", "impact": SEVERITY["low"], "reason": "Kitchen extinguisher reduces fire spread risk"})
        if not cv.get("smoke_detector_visible"):
            categories["fire"] += SEVERITY["medium"]
            drivers.append({"category": "fire", "finding": "No smoke detector visible", "impact": SEVERITY["medium"], "reason": "NFPA: detectors reduce fire death risk by 50%"})

    elif area == "bathroom":
        if cv.get("mold_visible"):
            categories["water_damage"] += SEVERITY["high"]
            drivers.append({"category": "water_damage", "finding": "Mold in bathroom", "impact": SEVERITY["high"], "reason": "Confirms active or chronic water intrusion"})
        if cv.get("water_stains_visible"):
            categories["water_damage"] += SEVERITY["medium"]
            drivers.append({"category": "water_damage", "finding": "Water stains in bathroom", "impact": SEVERITY["medium"], "reason": "Indicates past or ongoing leak"})
        if cv.get("leaking_pipes_visible"):
            categories["water_damage"] += SEVERITY["critical"]
            drivers.append({"category": "water_damage", "finding": "Leaking pipes visible", "impact": SEVERITY["critical"], "reason": "Active leak — immediate water damage claim risk"})

    elif area == "basement":
        if cv.get("water_intrusion_signs"):
            categories["water_damage"] += SEVERITY["high"]
            drivers.append({"category": "water_damage", "finding": "Water intrusion in basement", "impact": SEVERITY["high"], "reason": "Leading cause of water damage claims"})
        if cv.get("mold_visible"):
            categories["water_damage"] += SEVERITY["high"]
            drivers.append({"category": "water_damage", "finding": "Mold in basement", "impact": SEVERITY["high"], "reason": "Confirms prolonged moisture problem"})
        if cv.get("foundation_cracks_visible"):
            categories["foundation"] += SEVERITY["high"]
            drivers.append({"category": "foundation", "finding": "Foundation cracks in basement", "impact": SEVERITY["high"], "reason": "Indicates foundation movement or water pressure"})
        if cv.get("exposed_wiring"):
            categories["fire"] += SEVERITY["high"]
            drivers.append({"category": "fire", "finding": "Exposed wiring in basement", "impact": SEVERITY["high"], "reason": "Direct fire hazard"})
        if not cv.get("sump_pump_present"):
            categories["water_damage"] += SEVERITY["medium"]
            drivers.append({"category": "water_damage", "finding": "No sump pump detected", "impact": SEVERITY["medium"], "reason": "Increases flood/water intrusion risk"})

    elif area == "electrical_panel":
        brand = cv.get("panel_brand_visible", "")
        if brand in ["Federal Pacific", "Zinsco"]:
            categories["fire"] += SEVERITY["critical"]
            drivers.append({"category": "fire", "finding": f"Defective panel: {brand}", "impact": SEVERITY["critical"], "reason": f"{brand} recalled by US CPSC — known fire hazard"})
        if cv.get("signs_of_burning"):
            categories["fire"] += SEVERITY["critical"]
            drivers.append({"category": "fire", "finding": "Burn marks on panel", "impact": SEVERITY["critical"], "reason": "Active arcing — immediate fire risk"})
        if cv.get("rust_present"):
            categories["fire"] += SEVERITY["medium"]
            drivers.append({"category": "fire", "finding": "Rust on electrical panel", "impact": SEVERITY["medium"], "reason": "Moisture in panel increases short circuit risk"})
        if cv.get("double_tapped_breakers"):
            categories["fire"] += SEVERITY["high"]
            drivers.append({"category": "fire", "finding": "Double-tapped breakers", "impact": SEVERITY["high"], "reason": "Overloads breakers — common electrical fire cause"})

    elif area == "foundation":
        severity = cv.get("crack_severity", "none")
        if severity == "severe":
            categories["foundation"] += SEVERITY["critical"]
            drivers.append({"category": "foundation", "finding": "Severe foundation cracks", "impact": SEVERITY["critical"], "reason": "Major structural movement — immediate risk"})
        elif severity == "moderate":
            categories["foundation"] += SEVERITY["high"]
            drivers.append({"category": "foundation", "finding": "Moderate foundation cracks", "impact": SEVERITY["high"], "reason": "Ongoing settlement or shifting"})
        elif severity == "hairline":
            categories["foundation"] += SEVERITY["low"]
            drivers.append({"category": "foundation", "finding": "Hairline foundation cracks", "impact": SEVERITY["low"], "reason": "Common but should be monitored"})
        if cv.get("water_damage_signs"):
            categories["water_damage"] += SEVERITY["medium"]
            drivers.append({"category": "water_damage", "finding": "Water signs at foundation", "impact": SEVERITY["medium"], "reason": "Drainage issue — accelerates deterioration"})

    elif area == "exterior":
        if cv.get("foundation_cracks_visible"):
            categories["foundation"] += SEVERITY["medium"]
            drivers.append({"category": "foundation", "finding": "Exterior foundation cracks", "impact": SEVERITY["medium"], "reason": "May indicate foundation movement"})
        if cv.get("tree_overhang"):
            categories["natural_disasters"] += SEVERITY["medium"]
            drivers.append({"category": "natural_disasters", "finding": "Tree overhanging structure", "impact": SEVERITY["medium"], "reason": "Increases storm damage risk to roof"})
        if not cv.get("security_camera"):
            categories["theft"] += SEVERITY["medium"]
            drivers.append({"category": "theft", "finding": "No security camera visible", "impact": SEVERITY["medium"], "reason": "Cameras reduce theft likelihood"})
        if not cv.get("deadbolt_visible"):
            categories["theft"] += SEVERITY["medium"]
            drivers.append({"category": "theft", "finding": "No deadbolt visible", "impact": SEVERITY["medium"], "reason": "Deadbolts significantly reduce forced entry risk"})
        if cv.get("vegetation_overgrowth"):
            categories["natural_disasters"] += SEVERITY["low"]
            drivers.append({"category": "natural_disasters", "finding": "Vegetation overgrowth", "impact": SEVERITY["low"], "reason": "Increases fire spread risk near structure"})

    elif area == "garage":
        if cv.get("flammable_storage_visible"):
            categories["fire"] += SEVERITY["high"]
            drivers.append({"category": "fire", "finding": "Flammable materials in garage", "impact": SEVERITY["high"], "reason": "Leading cause of garage fires"})
        if cv.get("clutter_level") == "high":
            categories["maintenance"] += SEVERITY["medium"]
            drivers.append({"category": "maintenance", "finding": "High clutter in garage", "impact": SEVERITY["medium"], "reason": "Increases fire spread and blocks emergency access"})

    elif area == "other":
        if cv.get("condition") == "poor":
            categories["maintenance"] += SEVERITY["high"]
            drivers.append({"category": "maintenance", "finding": "Poor overall condition", "impact": SEVERITY["high"], "reason": "Poor maintenance correlates with higher claim frequency"})
        elif cv.get("condition") == "fair":
            categories["maintenance"] += SEVERITY["medium"]
            drivers.append({"category": "maintenance", "finding": "Fair overall condition", "impact": SEVERITY["medium"], "reason": "Indicates moderate deferred upkeep risk"})

    return categories, drivers


def apply_inspection_modifiers(categories, doc, drivers):
    roof_age = doc.get("roof_age") or 0
    if roof_age > 25:
        categories["roof"] += SEVERITY["critical"]
        drivers.append({"category": "roof", "finding": f"Roof age: {roof_age} years", "impact": SEVERITY["critical"], "reason": "Over 25 years — exceeds typical lifespan"})
    elif roof_age > 15:
        categories["roof"] += SEVERITY["high"]
        drivers.append({"category": "roof", "finding": f"Roof age: {roof_age} years", "impact": SEVERITY["high"], "reason": "Approaching end of typical lifespan"})

    if doc.get("foundation_issues"):
        categories["foundation"] += SEVERITY["high"]
        drivers.append({"category": "foundation", "finding": "Foundation issues in inspection", "impact": SEVERITY["high"], "reason": "Documented foundation risk"})

    if doc.get("water_damage_history"):
        categories["water_damage"] += SEVERITY["high"]
        drivers.append({"category": "water_damage", "finding": "Water damage history", "impact": SEVERITY["high"], "reason": "Past damage increases recurring claim likelihood"})

    if doc.get("mold_present"):
        categories["water_damage"] += SEVERITY["high"]
        drivers.append({"category": "water_damage", "finding": "Mold in inspection report", "impact": SEVERITY["high"], "reason": "Confirms chronic moisture problem"})

    if doc.get("plumbing_issues"):
        categories["water_damage"] += SEVERITY["medium"]
        drivers.append({"category": "water_damage", "finding": "Plumbing issues noted", "impact": SEVERITY["medium"], "reason": "Primary cause of water damage claims"})

    panel = doc.get("electrical_panel_brand", "")
    if panel in ["Federal Pacific", "Zinsco"]:
        categories["fire"] += SEVERITY["critical"]
        drivers.append({"category": "fire", "finding": f"Defective panel: {panel}", "impact": SEVERITY["critical"], "reason": f"{panel} recalled by US CPSC"})

    if not doc.get("smoke_detectors_present"):
        categories["fire"] += SEVERITY["medium"]
        drivers.append({"category": "fire", "finding": "No smoke detectors documented", "impact": SEVERITY["medium"], "reason": "NFPA: detectors cut fire death risk by 50%"})

    if not doc.get("security_system"):
        categories["theft"] += SEVERITY["low"]
        drivers.append({"category": "theft", "finding": "No security system documented", "impact": SEVERITY["low"], "reason": "Security systems reduce theft claim likelihood"})

    return categories, drivers


def apply_claims_modifiers(categories, claims, drivers):
    fire_claims    = claims.get("prior_fire_claims") or 0
    water_claims   = claims.get("prior_water_claims") or 0
    theft_claims   = claims.get("prior_theft_claims") or 0
    weather_claims = claims.get("prior_weather_claims") or 0

    if fire_claims > 0:
        categories["fire"] += SEVERITY["high"] * fire_claims
        drivers.append({"category": "fire", "finding": f"{fire_claims} prior fire claim(s)", "impact": SEVERITY["high"] * fire_claims, "reason": "Strongest predictor of future fire claims"})
    if water_claims > 0:
        categories["water_damage"] += SEVERITY["high"] * water_claims
        drivers.append({"category": "water_damage", "finding": f"{water_claims} prior water claim(s)", "impact": SEVERITY["high"] * water_claims, "reason": "Strongly predicts future water damage claims"})
    if theft_claims > 0:
        categories["theft"] += SEVERITY["medium"] * theft_claims
        drivers.append({"category": "theft", "finding": f"{theft_claims} prior theft claim(s)", "impact": SEVERITY["medium"] * theft_claims, "reason": "Indicates elevated security risk"})
    if weather_claims > 0:
        categories["natural_disasters"] += SEVERITY["medium"] * weather_claims
        drivers.append({"category": "natural_disasters", "finding": f"{weather_claims} prior weather claim(s)", "impact": SEVERITY["medium"] * weather_claims, "reason": "Reflects location exposure to natural disasters"})

    return categories, drivers


# ─────────────────────────────────────────
# SCORE CALCULATION
# ─────────────────────────────────────────

def calculate_risk_score(cv_findings=None, inspection_data=None, claims_data=None):
    categories = {
        "roof":              30,
        "water_damage":      30,
        "fire":              30,
        "theft":             30,
        "foundation":        30,
        "natural_disasters": 30,
        "maintenance":       30,
    }
    drivers = []

    if cv_findings:
        categories, drivers = apply_cv_modifiers(categories, cv_findings, drivers)
    if inspection_data:
        categories, drivers = apply_inspection_modifiers(categories, inspection_data, drivers)
    if claims_data:
        categories, drivers = apply_claims_modifiers(categories, claims_data, drivers)

    categories     = {k: max(0, min(100, v)) for k, v in categories.items()}
    final_score    = round(sum(categories[k] * WEIGHTS[k] for k in WEIGHTS))
    drivers_sorted = sorted(drivers, key=lambda x: x["impact"], reverse=True)

    if final_score >= 70:   label = "High Risk"
    elif final_score >= 45: label = "Moderate Risk"
    else:                   label = "Low Risk"

    top_category = max(categories, key=categories.get)

    return {
        "final_score":   final_score,
        "label":         label,
        "categories":    categories,
        "top_drivers":   drivers_sorted[:3],
        "all_drivers":   drivers_sorted,
        "summary":       f"Your home scored {final_score}/100 ({label}). Biggest risk: {top_category.replace('_',' ').title()}.",
        "weight_source": "Weights based on Insurance Information Institute 2023 claims frequency data."
    }


# ─────────────────────────────────────────
# CHATBOT
# ─────────────────────────────────────────

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

def simulate_what_if(current_categories, current_score, action):
    impacts = SUGGESTION_IMPACTS.get(action, {})
    if not impacts:
        return None

    new_categories = current_categories.copy()
    for category, change in impacts.items():
        new_categories[category] = max(0, min(100, new_categories[category] + change))

    new_score   = round(sum(new_categories[k] * WEIGHTS[k] for k in WEIGHTS))
    improvement = current_score - new_score

    return {
        "action":        action,
        "current_score": current_score,
        "new_score":     new_score,
        "improvement":   improvement,
        "affected":      impacts,
        "message":       f"If you {action.replace('_',' ')}, your score would improve from {current_score} to {new_score} (↓{improvement} points)."
    }


def chat_with_openai(user_message, property_context):
    system_prompt = f"""
    You are a home risk assessment advisor. You know everything about this specific property:

    Risk Score: {property_context.get('final_score')}/100 ({property_context.get('label')})

    Category Scores:
    {json.dumps(property_context.get('categories', {}), indent=2)}

    Top Risk Drivers:
    {json.dumps(property_context.get('top_drivers', []), indent=2)}

    Weight Source: {property_context.get('weight_source')}

    Your job:
    - Answer questions about this specific home's risks
    - Explain what's driving the score in plain English
    - Tell users what happens if they take specific actions
    - Be specific, helpful, and reference the actual data
    - Keep responses under 150 words
    - Never make up data not in the context above
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=300,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
    )

    return response.choices[0].message.content


# ─────────────────────────────────────────
# FEATURE FORMATTING
# ─────────────────────────────────────────

PHOTO_FEATURE_LABELS = {
    "roof": [
        ("sagging",          "Roof sagging",              "roof"),
        ("missing_shingles", "Missing shingles",           "roof"),
        ("moss_present",     "Moss/algae on roof",         "roof"),
    ],
    "kitchen": [
        ("grease_buildup_near_stove",   "Grease buildup near stove",     "fire"),
        ("water_stains_visible",        "Water stains in kitchen",        "water_damage"),
        ("leaking_pipes_visible",       "Leaking pipes in kitchen",       "water_damage"),
        ("fire_extinguisher_visible",   "Fire extinguisher present",      "fire"),
        ("smoke_detector_visible",      "Smoke detector present",         "fire"),
    ],
    "bathroom": [
        ("mold_visible",         "Mold visible",              "water_damage"),
        ("water_stains_visible", "Water stains in bathroom",  "water_damage"),
        ("leaking_pipes_visible","Leaking pipes in bathroom", "water_damage"),
    ],
    "basement": [
        ("water_intrusion_signs",    "Water intrusion signs",       "water_damage"),
        ("mold_visible",             "Mold in basement",            "water_damage"),
        ("foundation_cracks_visible","Foundation cracks in basement","foundation"),
        ("exposed_wiring",           "Exposed wiring",              "fire"),
        ("sump_pump_present",        "Sump pump present",           "water_damage"),
    ],
    "electrical_panel": [
        ("signs_of_burning",      "Burn marks on panel",       "fire"),
        ("rust_present",          "Rust on panel",             "fire"),
        ("double_tapped_breakers","Double-tapped breakers",    "fire"),
        ("breakers_labeled",      "Breakers labeled",          "fire"),
    ],
    "foundation": [
        ("cracks_visible",    "Cracks visible",        "foundation"),
        ("water_damage_signs","Water damage signs",    "water_damage"),
    ],
    "exterior": [
        ("foundation_cracks_visible","Foundation cracks visible",  "foundation"),
        ("water_stains",             "Water stains on exterior",   "water_damage"),
        ("tree_overhang",            "Tree overhanging structure", "natural_disasters"),
        ("vegetation_overgrowth",    "Vegetation overgrowth",      "natural_disasters"),
        ("security_camera",          "Security camera present",    "theft"),
        ("deadbolt_visible",         "Deadbolt visible",           "theft"),
    ],
    "garage": [
        ("flammable_storage_visible","Flammable materials stored", "fire"),
    ],
}

INSPECTION_FEATURE_LABELS = [
    ("foundation_issues",        "Foundation issues documented",     "foundation"),
    ("water_damage_history",     "Water damage history",             "water_damage"),
    ("mold_present",             "Mold present",                     "water_damage"),
    ("plumbing_issues",          "Plumbing issues noted",            "water_damage"),
    ("smoke_detectors_present",  "Smoke detectors present",          "fire"),
    ("carbon_monoxide_detectors","Carbon monoxide detectors present","fire"),
    ("security_system",          "Security system present",          "theft"),
]

CLAIMS_FEATURE_LABELS = [
    ("prior_fire_claims",    "Prior fire claims",    "fire"),
    ("prior_water_claims",   "Prior water claims",   "water_damage"),
    ("prior_theft_claims",   "Prior theft claims",   "theft"),
    ("prior_weather_claims", "Prior weather claims", "natural_disasters"),
]

def format_photo_features(findings):
    area_type = findings.get("area_type", "other")
    features  = []

    condition = findings.get("condition")
    if condition:
        features.append({
            "feature":  "Overall condition",
            "present":  condition,
            "category": "maintenance"
        })

    if area_type == "roof":
        age = findings.get("estimated_age")
        if age:
            features.append({"feature": f"Estimated roof age", "present": age, "category": "roof"})

    if area_type == "electrical_panel":
        brand = findings.get("panel_brand_visible")
        if brand:
            features.append({"feature": "Panel brand", "present": brand, "category": "fire"})

    for key, label, category in PHOTO_FEATURE_LABELS.get(area_type, []):
        val = findings.get(key)
        if val is not None:
            features.append({"feature": label, "present": val, "category": category})

    return {"source": "photo", "area_type": area_type, "features": features}


def format_inspection_features(doc):
    features = []

    roof_age = doc.get("roof_age")
    if roof_age is not None:
        features.append({"feature": "Roof age (years)", "present": roof_age, "category": "roof"})

    roof_material = doc.get("roof_material")
    if roof_material:
        features.append({"feature": "Roof material", "present": roof_material, "category": "roof"})

    panel = doc.get("electrical_panel_brand")
    if panel:
        features.append({"feature": "Electrical panel brand", "present": panel, "category": "fire"})

    hvac = doc.get("hvac_last_service")
    if hvac is not None:
        features.append({"feature": "HVAC last serviced (year)", "present": hvac, "category": "maintenance"})

    wh_age = doc.get("water_heater_age")
    if wh_age is not None:
        features.append({"feature": "Water heater age (years)", "present": wh_age, "category": "water_damage"})

    for key, label, category in INSPECTION_FEATURE_LABELS:
        val = doc.get(key)
        if val is not None:
            features.append({"feature": label, "present": val, "category": category})

    return {"source": "inspection", "features": features}


def format_claims_features(claims):
    features = []

    total = claims.get("total_claims_count")
    if total is not None:
        features.append({"feature": "Total claims count", "present": total, "category": "general"})

    recent = claims.get("most_recent_claim_year")
    if recent is not None:
        features.append({"feature": "Most recent claim year", "present": recent, "category": "general"})

    for key, label, category in CLAIMS_FEATURE_LABELS:
        val = claims.get(key)
        if val is not None:
            features.append({"feature": label, "present": val, "category": category})

    return {"source": "claims", "features": features}


# ─────────────────────────────────────────
# FLASK ROUTES
# ─────────────────────────────────────────

@risk_bp.route("/analyze", methods=["POST"])
def analyze():
    results = []

    if "photo" in request.files:
        photo       = request.files["photo"]
        image_bytes = photo.read()
        media_type  = photo.content_type or "image/jpeg"
        findings    = analyze_photo(image_bytes, media_type)
        results.append(format_photo_features(findings))

    if "inspection" in request.files:
        pdf  = request.files["inspection"]
        doc  = parse_document(pdf.read(), "inspection")
        results.append(format_inspection_features(doc))

    if "claims" in request.files:
        pdf    = request.files["claims"]
        claims = parse_document(pdf.read(), "claims")
        results.append(format_claims_features(claims))

    return jsonify({"detections": results})


@risk_bp.route("/whatif", methods=["POST"])
def what_if():
    data               = request.json
    action             = data.get("action")
    current_categories = data.get("categories")
    current_score      = data.get("current_score")

    if not all([action, current_categories, current_score]):
        return jsonify({"error": "Missing required fields"}), 400

    result = simulate_what_if(current_categories, current_score, action)

    if not result:
        return jsonify({"error": f"Unknown action: {action}"}), 400

    return jsonify(result)


@risk_bp.route("/chat", methods=["POST"])
def chat():
    data             = request.json
    user_message     = data.get("message")
    property_context = data.get("property_context")

    if not user_message or not property_context:
        return jsonify({"error": "Missing message or property context"}), 400

    response = chat_with_openai(user_message, property_context)
    return jsonify({"response": response})


@risk_bp.route("/suggestions", methods=["GET"])
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
