import json
import re
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

FINAL_JSON_PATH = Path(__file__).resolve().parents[2] / "final.json"
RISK_JSON_PATH = Path(__file__).resolve().parents[2] / "risk.json"
REFERENCE_DATE = date(2026, 4, 12)

SUBSCORE_WEIGHTS = {
    "roofWeatherScore": 0.25,
    "waterPlumbingScore": 0.22,
    "fireElectricalScore": 0.18,
    "securityScore": 0.15,
    "structuralScore": 0.12,
    "claimsHistoryScore": 0.08,
}


def _load_json_file(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def _save_json_file(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _normalize_severity_multiplier(severity: Any) -> float:
    normalized = str(severity or "unknown").strip().lower()
    if normalized == "high":
        return 1.4
    if normalized in {"moderate", "medium"}:
        return 1.1
    if normalized == "low":
        return 0.8
    return 1.0


def _normalize_number(value: Any, default: float = 0.0) -> float:
    if isinstance(value, (int, float)):
        return float(value)

    if value is None:
        return default

    text = str(value).strip()
    if not text:
        return default

    match = re.search(r"-?\d+(\.\d+)?", text.replace(",", ""))
    if not match:
        return default

    try:
        return float(match.group(0))
    except ValueError:
        return default


def _normalize_int(value: Any, default: int = 0) -> int:
    return int(round(_normalize_number(value, default)))


def _normalize_key(value: Any) -> str:
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def _quiz_map(final_document: dict[str, Any]) -> dict[str, int]:
    responses = final_document.get("quiz", {}).get("responses", [])
    quiz_lookup: dict[str, int] = {}

    for item in responses:
        if not isinstance(item, dict):
            continue
        quiz_lookup[str(item.get("id", ""))] = max(0, _normalize_int(item.get("answer", 0)))

    return quiz_lookup


def _extract_property_feature_value(features: list[Any], feature_key: str) -> Any:
    for feature in features:
        if isinstance(feature, dict) and feature.get("feature_key") == feature_key:
            return feature.get("value")
    return None


def _parse_roof_remaining_life_max(value: Any) -> int | None:
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return int(value)

    numbers = [int(match) for match in re.findall(r"\d+", str(value))]
    if not numbers:
        return None

    return max(numbers)


def _add_contribution(contributions: list[dict[str, Any]], reason: str, value: float) -> None:
    contributions.append({"reason": reason, "value": round(value, 2)})


def _cap_score(score: float) -> float:
    return max(0.0, min(100.0, score))


def _parse_iso_date(value: Any) -> date | None:
    if not value:
        return None

    text = str(value).strip()
    if not text:
        return None

    for parser in (datetime.fromisoformat,):
        try:
            return parser(text.replace("Z", "+00:00")).date()
        except ValueError:
            continue

    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue

    return None


def _is_recent_claim(document: dict[str, Any]) -> bool:
    for key in ("date_of_loss", "date_reported", "inspection_date"):
        parsed = _parse_iso_date(document.get(key))
        if parsed and (REFERENCE_DATE - parsed).days <= 365:
            return True
    return False


def _calculate_roof_weather_score(final_document: dict[str, Any]) -> dict[str, Any]:
    document_extraction = final_document.get("document_risk_extraction", {})
    photo_extraction = final_document.get("photo_risk_extraction", {})
    address = final_document.get("address", {})
    quiz = _quiz_map(final_document)
    contributions: list[dict[str, Any]] = []
    score = 0.0

    for factor in document_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        category = _normalize_key(factor.get("category"))
        if category not in {"roof", "hail", "wind"}:
            continue
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        increment = 12 * _normalize_severity_multiplier(factor.get("severity")) * occurrences
        score += increment
        _add_contribution(contributions, f"document risk factor {factor.get('factor_key')}", increment)

    for factor in photo_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        if _normalize_key(factor.get("category")) != "roof":
            continue
        if _normalize_key(factor.get("severity")) != "high":
            continue
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        increment = 20 * occurrences
        score += increment
        _add_contribution(contributions, f"photo roof risk {factor.get('factor_key')}", increment)

    roof_remaining_life = _parse_roof_remaining_life_max(
        _extract_property_feature_value(document_extraction.get("property_features", []), "roof_remaining_life")
    )
    if roof_remaining_life is not None:
        if roof_remaining_life <= 5:
            score += 20
            _add_contribution(contributions, "roof remaining life <= 5 years", 20)
        elif roof_remaining_life <= 10:
            score += 10
            _add_contribution(contributions, "roof remaining life 6-10 years", 10)

    storm_risk_score = _normalize_number(address.get("storm_risk_score"), 0.0)
    storm_increment = (storm_risk_score / 100.0) * 15.0
    score += storm_increment
    _add_contribution(contributions, "address storm risk score", storm_increment)

    shutters_deduction = min(score, quiz.get("storm_shutters_or_impact_openings", 0) * 3)
    if shutters_deduction:
        score -= shutters_deduction
        _add_contribution(contributions, "storm shutters or impact openings deduction", -shutters_deduction)

    generator_deduction = min(score, min(10, quiz.get("backup_generators", 0) * 2))
    if generator_deduction:
        score -= generator_deduction
        _add_contribution(contributions, "backup generators resilience deduction", -generator_deduction)

    return {"score": round(_cap_score(score)), "contributions": contributions}


def _calculate_water_plumbing_score(final_document: dict[str, Any]) -> dict[str, Any]:
    document_extraction = final_document.get("document_risk_extraction", {})
    photo_extraction = final_document.get("photo_risk_extraction", {})
    quiz = _quiz_map(final_document)
    contributions: list[dict[str, Any]] = []
    score = 0.0

    for factor in document_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        category = _normalize_key(factor.get("category"))
        if category not in {"water_damage", "plumbing"}:
            continue
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        increment = 14 * _normalize_severity_multiplier(factor.get("severity")) * occurrences
        score += increment
        _add_contribution(contributions, f"document risk factor {factor.get('factor_key')}", increment)

    for factor in photo_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        if _normalize_key(factor.get("category")) != "water_damage":
            continue
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        increment = 18 * occurrences
        score += increment
        _add_contribution(contributions, f"photo water risk {factor.get('factor_key')}", increment)

    summary_counts = document_extraction.get("summary_counts", {})
    combined_water_count = _normalize_int(summary_counts.get("water_damage", 0)) + _normalize_int(summary_counts.get("plumbing", 0))
    if combined_water_count > 3:
        score += 10
        _add_contribution(contributions, "water/plumbing summary count bonus", 10)

    water_leak_deduction = min(score, quiz.get("water_leak_detectors", 0) * 6)
    if water_leak_deduction:
        score -= water_leak_deduction
        _add_contribution(contributions, "water leak detectors deduction", -water_leak_deduction)

    shutoff_deduction = min(score, quiz.get("smart_water_shutoff_valves", 0) * 12)
    if shutoff_deduction:
        score -= shutoff_deduction
        _add_contribution(contributions, "smart water shutoff valves deduction", -shutoff_deduction)

    if any(
        isinstance(item, dict) and str(item.get("type", "")).lower() == "outstanding_reserve"
        for item in document_extraction.get("claims_financials", [])
    ):
        score += 8
        _add_contribution(contributions, "outstanding reserve present", 8)

    return {"score": round(_cap_score(score)), "contributions": contributions}


def _calculate_fire_electrical_score(final_document: dict[str, Any]) -> dict[str, Any]:
    document_extraction = final_document.get("document_risk_extraction", {})
    photo_extraction = final_document.get("photo_risk_extraction", {})
    quiz = _quiz_map(final_document)
    contributions: list[dict[str, Any]] = []
    score = 0.0

    for factor in document_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        category = _normalize_key(factor.get("category"))
        factor_key = _normalize_key(factor.get("factor_key"))
        if category in {"fire", "smoke", "electrical"}:
            occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
            increment = 14 * _normalize_severity_multiplier(factor.get("severity")) * occurrences
            score += increment
            _add_contribution(contributions, f"document risk factor {factor.get('factor_key')}", increment)
        if factor_key in {"smoke_detectors_missing", "missing_smoke_detectors"}:
            score += 15
            _add_contribution(contributions, "smoke detectors missing", 15)

    for feature_group in (
        document_extraction.get("protective_features", []),
        photo_extraction.get("protective_features", []),
    ):
        for feature in feature_group:
            if not isinstance(feature, dict):
                continue
            if _normalize_key(feature.get("category")) not in {"electrical", "electrical_safety"}:
                continue
            if feature.get("value") is True:
                deduction = min(score, 10)
                score -= deduction
                _add_contribution(contributions, f"protective electrical feature {feature.get('feature_key')}", -deduction)

    smoke_detector_deduction = min(14, quiz.get("working_smoke_detectors", 0) * 2)
    smoke_detector_deduction = min(score, smoke_detector_deduction)
    if smoke_detector_deduction:
        score -= smoke_detector_deduction
        _add_contribution(contributions, "working smoke detectors deduction", -smoke_detector_deduction)

    fire_alarm_deduction = min(score, quiz.get("monitored_fire_alarm_systems", 0) * 8)
    if fire_alarm_deduction:
        score -= fire_alarm_deduction
        _add_contribution(contributions, "monitored fire alarm systems deduction", -fire_alarm_deduction)

    extinguisher_deduction = min(8, quiz.get("fire_extinguishers", 0) * 4)
    extinguisher_deduction = min(score, extinguisher_deduction)
    if extinguisher_deduction:
        score -= extinguisher_deduction
        _add_contribution(contributions, "fire extinguishers deduction", -extinguisher_deduction)

    return {"score": round(_cap_score(score)), "contributions": contributions}


def _calculate_security_score(final_document: dict[str, Any]) -> dict[str, Any]:
    document_extraction = final_document.get("document_risk_extraction", {})
    address = final_document.get("address", {})
    quiz = _quiz_map(final_document)
    contributions: list[dict[str, Any]] = []
    score = 0.0

    for factor in document_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        category = _normalize_key(factor.get("category"))
        subcategory = _normalize_key(factor.get("subcategory"))
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        if category == "prior_loss_history" and subcategory in {"theft_burglary", "theft", "burglary"}:
            increment = 20 * occurrences
            score += increment
            _add_contribution(contributions, f"prior theft/burglary factor {factor.get('factor_key')}", increment)
        if category == "security":
            increment = 12 * occurrences
            score += increment
            _add_contribution(contributions, f"security factor {factor.get('factor_key')}", increment)

    burglar_alarm_deduction = min(score, quiz.get("burglar_alarms", 0) * 15)
    if burglar_alarm_deduction:
        score -= burglar_alarm_deduction
        _add_contribution(contributions, "burglar alarms deduction", -burglar_alarm_deduction)

    camera_deduction = min(20, quiz.get("exterior_security_cameras", 0) * 5)
    camera_deduction = min(score, camera_deduction)
    if camera_deduction:
        score -= camera_deduction
        _add_contribution(contributions, "exterior security cameras deduction", -camera_deduction)

    crime_score = _normalize_number(address.get("crime_insurance_score"), 0.0)
    if crime_score > 0:
        crime_increment = min(20.0, (crime_score / 100.0) * 20.0)
        score += crime_increment
        _add_contribution(contributions, "address crime insurance score", crime_increment)

    return {"score": round(_cap_score(score)), "contributions": contributions}


def _calculate_structural_score(final_document: dict[str, Any]) -> dict[str, Any]:
    document_extraction = final_document.get("document_risk_extraction", {})
    photo_extraction = final_document.get("photo_risk_extraction", {})
    address = final_document.get("address", {})
    contributions: list[dict[str, Any]] = []
    score = 0.0

    for factor in document_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        category = str(factor.get("category", "")).lower()
        factor_key = str(factor.get("factor_key", "")).lower()
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        if category in {"foundation", "structural"}:
            increment = 18 * _normalize_severity_multiplier(factor.get("severity")) * occurrences
            score += increment
            _add_contribution(contributions, f"document risk factor {factor.get('factor_key')}", increment)
        if factor_key == "possible_slab_moisture":
            score += 12
            _add_contribution(contributions, "possible slab moisture", 12)

    for factor in photo_extraction.get("risk_factors", []):
        if not isinstance(factor, dict):
            continue
        if str(factor.get("category", "")).lower() != "structural":
            continue
        occurrences = max(1, _normalize_int(factor.get("count", 1), 1))
        increment = 15 * _normalize_severity_multiplier(factor.get("severity")) * occurrences
        score += increment
        _add_contribution(contributions, f"photo structural risk {factor.get('factor_key')}", increment)

    year_built = _normalize_int(address.get("yearbuilt"))
    if 0 < year_built < 1980:
        score += 15
        _add_contribution(contributions, "address year built before 1980", 15)
    elif 1980 <= year_built <= 1999:
        score += 8
        _add_contribution(contributions, "address year built 1980-1999", 8)

    flood_zone = str(address.get("fema_flood_zone", "")).upper()
    if flood_zone.startswith(("A", "V")):
        score += 15
        _add_contribution(contributions, "high-risk FEMA flood zone", 15)

    return {"score": round(_cap_score(score)), "contributions": contributions}


def _calculate_claims_history_score(final_document: dict[str, Any]) -> dict[str, Any]:
    document_extraction = final_document.get("document_risk_extraction", {})
    contributions: list[dict[str, Any]] = []
    score = 0.0
    recent_claims = 0

    for document in document_extraction.get("documents", []):
        if not isinstance(document, dict):
            continue
        status = str(document.get("claim_status", "")).strip().lower()
        if not status:
            continue
        if "closed" in status and "paid" in status and "partial" not in status:
            score += 8
            _add_contribution(contributions, f"closed-paid claim {document.get('claim_number')}", 8)
        elif "open" in status:
            score += 15
            _add_contribution(contributions, f"open claim {document.get('claim_number')}", 15)
        elif "closed" in status and "partial" in status:
            score += 10
            _add_contribution(contributions, f"closed-partial claim {document.get('claim_number')}", 10)

        if _is_recent_claim(document):
            recent_claims += 1

    if recent_claims:
        recent_bonus = recent_claims * 5
        score += recent_bonus
        _add_contribution(contributions, "claims within 12 months of 2026-04-12", recent_bonus)

    repeated_claims = _normalize_int(document_extraction.get("summary_counts", {}).get("repeated_claims", 0))
    if repeated_claims:
        repeated_increment = repeated_claims * 12
        score += repeated_increment
        _add_contribution(contributions, "repeated claims summary count", repeated_increment)

    net_payments = sum(
        _normalize_number(item.get("amount"), 0.0)
        for item in document_extraction.get("claims_financials", [])
        if isinstance(item, dict) and str(item.get("type", "")).lower() == "net_payment_issued"
    )
    if net_payments > 30000:
        score += 10
        _add_contribution(contributions, "net payments issued > 30000", 10)
    elif net_payments > 15000:
        score += 5
        _add_contribution(contributions, "net payments issued > 15000", 5)

    return {"score": round(_cap_score(score)), "contributions": contributions}


def _risk_tier(master_score: int) -> str:
    if master_score <= 29:
        return "Low Risk"
    if master_score <= 49:
        return "Moderate Risk"
    if master_score <= 69:
        return "Elevated Risk"
    if master_score <= 84:
        return "High Risk"
    return "Critical Risk"


def calculate_risk_scores() -> dict[str, Any]:
    final_document = _load_json_file(FINAL_JSON_PATH)
    if not final_document:
        raise RuntimeError("final.json is missing or empty")

    roof_weather = _calculate_roof_weather_score(final_document)
    water_plumbing = _calculate_water_plumbing_score(final_document)
    fire_electrical = _calculate_fire_electrical_score(final_document)
    security = _calculate_security_score(final_document)
    structural = _calculate_structural_score(final_document)
    claims_history = _calculate_claims_history_score(final_document)

    subscores = {
        "roofWeatherScore": roof_weather["score"],
        "waterPlumbingScore": water_plumbing["score"],
        "fireElectricalScore": fire_electrical["score"],
        "securityScore": security["score"],
        "structuralScore": structural["score"],
        "claimsHistoryScore": claims_history["score"],
    }

    master_score = round(
        sum(subscores[key] * weight for key, weight in SUBSCORE_WEIGHTS.items())
    )

    risk_payload = {
        "referenceDate": REFERENCE_DATE.isoformat(),
        "sourceFile": str(FINAL_JSON_PATH),
        "masterScore": master_score,
        "riskTier": _risk_tier(master_score),
        "weights": SUBSCORE_WEIGHTS,
        "subscores": subscores,
        "details": {
            "roofWeatherScore": roof_weather["contributions"],
            "waterPlumbingScore": water_plumbing["contributions"],
            "fireElectricalScore": fire_electrical["contributions"],
            "securityScore": security["contributions"],
            "structuralScore": structural["contributions"],
            "claimsHistoryScore": claims_history["contributions"],
        },
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }

    _save_json_file(RISK_JSON_PATH, risk_payload)
    return risk_payload
