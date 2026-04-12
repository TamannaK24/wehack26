import re
import json
import time
from functools import lru_cache
from pathlib import Path
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import PyMongoError

from app.db import homes_collection


BACKEND_DIR = Path(__file__).resolve().parents[2]
ADDRESS_JSON_PATH = BACKEND_DIR / "address.json"
FINAL_JSON_PATH = BACKEND_DIR / "final.json"
MONGO_FALLBACK_COOLDOWN_SECONDS = 60

_mongo_retry_after = 0.0


def _serialize_home(home):
    if not home:
        return None

    return {
        "id": str(home.get("_id")),
        "address": home.get("parcel_address"),
        "city": home.get("parcel_city"),
        "state": home.get("parcel_state"),
        "zip": home.get("parcel_zip"),
        "latitude": home.get("input_latitude"),
        "longitude": home.get("input_longitude"),
        "county": home.get("county"),
        "usecode": home.get("usecode"),
        "usedesc": home.get("usedesc"),
        "zoning": home.get("zoning"),
        "zoning_description": home.get("zoning_description"),
        "zoning_type": home.get("zoning_type"),
        "zoning_subtype": home.get("zoning_subtype"),
        "structstyle": home.get("structstyle"),
        "numunits": home.get("numunits"),
        "numstories": home.get("numstories"),
        "yearbuilt": home.get("yearbuilt"),
        "sqft": home.get("sqft"),
        "acres": home.get("acres"),
        "fema_flood_zone": home.get("fema_flood_zone"),
        "fema_zone_desc": home.get("fema_zone_desc"),
        "crime_total": home.get("crime_total"),
        "crime_insurance_score": home.get("crime_insurance_score"),
        "storm_risk_score": home.get("storm_risk_score"),
    }


def _format_search_result(item, fallback_id=None):
    street = item.get("parcel_address") or item.get("address") or ""
    city = item.get("parcel_city") or item.get("city") or ""
    state = item.get("parcel_state") or item.get("state") or ""
    zip_code = item.get("parcel_zip") or item.get("zip") or ""
    item_id = item.get("_id") or item.get("id") or item.get("home_id") or fallback_id

    full_address = f"{street}, {city}, {state} {zip_code}".strip()

    return {
        "id": str(item_id),
        "label": full_address,
        "street": street,
        "city": city,
        "state": state,
        "zip": zip_code,
    }


@lru_cache(maxsize=1)
def _load_local_addresses():
    with ADDRESS_JSON_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        return [data]

    return data


def _search_addresses_in_local_file(query):
    plain_query = query.strip().lower()
    if not plain_query:
        return []

    matches = []
    for index, item in enumerate(_load_local_addresses()):
        street = (item.get("parcel_address") or "").lower()
        if plain_query not in street:
            continue

        matches.append(_format_search_result(item, fallback_id=f"local-{index}"))
        if len(matches) >= 10:
            break

    return matches


def _find_local_address_by_id(address_id):
    for index, item in enumerate(_load_local_addresses()):
        local_id = str(item.get("id") or item.get("home_id") or f"local-{index}")
        if local_id == str(address_id):
            return item
    return None


def _get_local_addresses(limit=100):
    items = []
    for index, item in enumerate(_load_local_addresses()[:limit]):
        formatted = _format_search_result(item, fallback_id=f"local-{index}")
        items.append(
            {
                "id": formatted["id"],
                "address": formatted["street"],
                "city": formatted["city"],
                "state": formatted["state"],
                "zip": formatted["zip"],
            }
        )
    return items


def _can_query_mongo():
    return time.monotonic() >= _mongo_retry_after


def _mark_mongo_unavailable():
    global _mongo_retry_after
    _mongo_retry_after = time.monotonic() + MONGO_FALLBACK_COOLDOWN_SECONDS


def get_all_addresses():
    if not _can_query_mongo():
        return _get_local_addresses()

    try:
        homes = homes_collection.find().limit(100)
        return [_serialize_home(home) for home in homes]
    except PyMongoError:
        _mark_mongo_unavailable()
        return _get_local_addresses()

def search_addresses_in_db(query):
    if not query or not query.strip():
        return []

    if not _can_query_mongo():
        return _search_addresses_in_local_file(query)

    plain_text_query = re.escape(query.strip())

    try:
        results = homes_collection.find(
            {
                "parcel_address": {
                    "$regex": plain_text_query,
                    "$options": "i"
                }
            },
            {
                "_id": 1,
                "parcel_address": 1,
                "parcel_city": 1,
                "parcel_state": 1,
                "parcel_zip": 1
            }
        ).limit(10)

        return [_format_search_result(item) for item in results]
    except PyMongoError:
        _mark_mongo_unavailable()
        return _search_addresses_in_local_file(query)


def get_address_by_id(address_id):
    if _can_query_mongo() and ObjectId.is_valid(address_id):
        try:
            home = homes_collection.find_one({"_id": ObjectId(address_id)})
            if home:
                return _serialize_home(home)
        except PyMongoError:
            _mark_mongo_unavailable()

    local_home = _find_local_address_by_id(address_id)
    return _serialize_home(local_home) if local_home else None


def save_selected_address_to_final_json(address_id):
    address = get_address_by_id(address_id)
    if not address:
        return None

    existing = {}
    if FINAL_JSON_PATH.exists():
        try:
            existing = json.loads(FINAL_JSON_PATH.read_text(encoding="utf-8"))
            if not isinstance(existing, dict):
                existing = {}
        except json.JSONDecodeError:
            existing = {}

    existing["address"] = address
    existing["addressSavedAt"] = datetime.now(timezone.utc).isoformat()

    FINAL_JSON_PATH.write_text(json.dumps(existing, indent=2), encoding="utf-8")
    return existing
